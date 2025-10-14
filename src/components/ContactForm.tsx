"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Contact form submitted:', formData);
      setIsSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Reach out to us through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href="tel:+923104362226" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        +92 310 4362226
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:infoalshahidinstitute@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors break-all">
                        infoalshahidinstitute@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        Online Classes Available Worldwide
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-white">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Office Hours</h3>
                  <p className="text-sm text-white/90">Monday - Friday: 9:00 AM - 6:00 PM (PKT)</p>
                  <p className="text-sm text-white/90">Saturday: 10:00 AM - 4:00 PM (PKT)</p>
                  <p className="text-sm text-white/90">Sunday: Closed</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Full Name *</Label>
                          <Input
                            id="contact-name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email Address *</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Phone Number</Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-subject">Subject *</Label>
                          <Input
                            id="contact-subject"
                            placeholder="How can we help?"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Message *</Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Tell us more about your inquiry..."
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                      <p className="text-muted-foreground">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
