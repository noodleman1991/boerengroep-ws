'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const newsletterSchema = z.object({
    email: z.string().email('Invalid email address'),
    consent: z.boolean().refine(val => val === true, 'You must consent to receive newsletters'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
    variant?: 'card' | 'inline' | 'compact';
    source?: string;
    className?: string;
}

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

export function NewsletterSignup({
    variant = 'card',
    source = 'website',
    className = ''
}: NewsletterSignupProps) {
    const t = useTranslations('newsletter.signup');
    const locale = useLocale();
    const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const form = useForm<NewsletterFormData>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            email: '',
            consent: false,
        },
    });

    const onSubmit = async (data: NewsletterFormData) => {
        setSubmissionState('loading');
        setErrorMessage('');

        try {
            const response = await fetch(`/${locale}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    language: locale,
                    consent: data.consent,
                    source,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Subscription failed');
            }

            setSubmissionState('success');
            form.reset();
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setSubmissionState('error');
            setErrorMessage(error instanceof Error ? error.message : t('error_message'));
        }
    };

    const renderForm = () => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={variant === 'compact' ? 'sr-only' : undefined}>
                                Email Address
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder={t('email_placeholder')}
                                    disabled={submissionState === 'loading'}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={submissionState === 'loading'}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                    {t('consent_text')}
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={submissionState === 'loading'}
                    className="w-full"
                >
                    {submissionState === 'loading' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('submit_button')}
                </Button>
            </form>
        </Form>
    );

    const renderContent = () => {
        if (submissionState === 'success') {
            return (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        {t('success_message')}
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <>
                {renderForm()}
                {submissionState === 'error' && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                )}
            </>
        );
    };

    if (variant === 'compact') {
        return (
            <div className={`space-y-4 ${className}`}>
                {renderContent()}
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className={`bg-muted/50 rounded-lg p-6 ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                </div>
                {renderContent()}
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                    {t('consent_text')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
