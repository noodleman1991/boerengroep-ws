'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';

const newsletterSchema = z.object({
    email: z.string().email('Invalid email address'),
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
        },
    });

    const onSubmit = async (data: NewsletterFormData) => {
        setSubmissionState('loading');
        setErrorMessage('');

        try {
            const response = await fetch(`/api/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    language: locale,
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

    const renderConsentStatement = () => (
        <p className="text-xs text-muted-foreground">
            {t.rich('consent_statement', {
                privacyPolicy: (chunks) => (
                    <Link
                        href="/privacy-policy"
                        className="underline hover:text-primary"
                    >
                        {chunks}
                    </Link>
                ),
            })}
        </p>
    );

    const renderForm = () => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={variant === 'compact' ? 'sr-only' : undefined}>
                                {t('email_label')}
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

                {renderConsentStatement()}

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
                    <Alert className="border-red-200 bg-red-50 mt-4">
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
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                {renderContent()}
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    {t('title')}
                </CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
