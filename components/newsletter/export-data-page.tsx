'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle, AlertCircle, Loader2, Download, Shield } from 'lucide-react';

const exportSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportDataPageProps {
    locale: string;
}

type ExportState = 'idle' | 'loading' | 'success' | 'error';

export const ExportDataPage = ({ locale }: ExportDataPageProps) => {
    const t = useTranslations('newsletter.exportData');
    const [state, setState] = useState<ExportState>('idle');
    const [message, setMessage] = useState<string>('');

    const form = useForm<ExportFormData>({
        resolver: zodResolver(exportSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ExportFormData) => {
        setState('loading');

        try {
            const response = await fetch('/api/newsletter/export-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    language: locale,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setState('success');
                setMessage(result.message);
                form.reset();
            } else {
                setState('error');
                setMessage(result.error);
            }
        } catch (error) {
            setState('error');
            setMessage(t('error_message'));
        }
    };

    return (
        <Section>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <Shield className="h-16 w-16 mx-auto text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t('description')}
                    </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        {t('what_included')}
                    </h2>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• {t('included_subscription')}</li>
                        <li>• {t('included_consent')}</li>
                        <li>• {t('included_preferences')}</li>
                        <li>• {t('included_statistics')}</li>
                    </ul>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('email_label')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={t('email_placeholder')}
                                            disabled={state === 'loading'}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {state === 'success' && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    {message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {state === 'error' && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    {message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            disabled={state === 'loading'}
                            className="w-full"
                        >
                            {state === 'loading' && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Download className="mr-2 h-4 w-4" />
                            {t('request_export')}
                        </Button>
                    </form>
                </Form>

                <div className="text-sm text-muted-foreground space-y-2">
                    <p>{t('gdpr_notice')}</p>
                    <p>{t('delivery_notice')}</p>
                </div>
            </div>
        </Section>
    );
};
