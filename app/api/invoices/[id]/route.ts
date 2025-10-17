import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, getTeacherId } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for updating an invoice
const updateInvoiceSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().optional(),
  status: z.enum(['UNPAID', 'PAID', 'OVERDUE', 'PENDING_VERIFICATION']).optional(),
});

// GET /api/invoices/[id] - Get single invoice details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);
    const invoiceId = params.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            contactEmail: true,
            teacherId: true,
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        paymentReceipts: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Authorization: Check if user has access to this invoice
    if (user.role === 'TEACHER') {
      const teacherId = await getTeacherId(user.id);
      if (!teacherId || invoice.student.teacherId !== teacherId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    } else if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student || invoice.studentId !== student.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch invoice' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// PATCH /api/invoices/[id] - Update invoice (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const invoiceId = params.id;
    const body = await request.json();

    // Validate request body
    const validatedData = updateInvoiceSchema.parse(body);

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(validatedData.amount !== undefined && {
          amount: validatedData.amount,
        }),
        ...(validatedData.dueDate && {
          dueDate: new Date(validatedData.dueDate),
        }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.status && {
          status: validatedData.status,
        }),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            contactEmail: true,
          },
        },
        paymentReceipts: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully',
    });
  } catch (error: any) {
    console.error('Update invoice error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update invoice' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const invoiceId = params.id;

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        paymentReceipts: true,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Delete associated payment receipts first (cascade)
    await prisma.paymentReceipt.deleteMany({
      where: { invoiceId: invoiceId },
    });

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete invoice' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
