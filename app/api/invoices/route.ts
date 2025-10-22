import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, getTeacherId } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for creating an invoice
const createInvoiceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Invalid due date format'),
  description: z.string().optional(),
});

// POST /api/invoices - Create a new invoice (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const body = await request.json();

    // Validate request body
    const validatedData = createInvoiceSchema.parse(body);

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        studentId: validatedData.studentId,
        amount: validatedData.amount,
        dueDate: new Date(validatedData.dueDate),
        notes: validatedData.description,
        status: 'UNPAID',
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            contactEmail: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: invoice,
        message: 'Invoice created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create invoice error:', error);

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
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// GET /api/invoices - List invoices (scoped by role)
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    // Build where clause based on role
    let whereClause: any = {};

    if (user.role === 'TEACHER') {
      // Teachers see invoices for their assigned students only
      const teacherId = await getTeacherId(user.id);
      if (!teacherId) {
        return NextResponse.json(
          { success: false, error: 'Teacher profile not found' },
          { status: 404 }
        );
      }
      whereClause.student = {
        teacherId: teacherId,
      };
    } else if (user.role === 'STUDENT') {
      // Students see only their own invoices
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student profile not found' },
          { status: 404 }
        );
      }
      whereClause.studentId = student.id;
    }

    // Apply additional filters
    if (studentId) {
      // Verify access to this student
      if (user.role === 'TEACHER') {
        const teacherId = await getTeacherId(user.id);
        const student = await prisma.student.findFirst({
          where: {
            id: studentId,
            teacherId: teacherId,
          },
        });
        if (!student) {
          return NextResponse.json(
            { success: false, error: 'Student not found or access denied' },
            { status: 403 }
          );
        }
      }
      whereClause.studentId = studentId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Fetch invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              contactEmail: true,
              teacher: {
                include: {
                  user: {
                    select: {
                      fullName: true,
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
        orderBy: {
          dueDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('List invoices error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch invoices' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
