'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle, AlertCircle, Loader2, Trash2, AlertTriangle } from 'lucide-react';

const deleteSchema = z.object({
    email: z.string().email('Invalid email address'),
    confirmation: z.boolean().refine(val => val === true, 'You must confirm deletion'),
    reason: z.string().max(1000).optional(),
});

type DeleteFormData = z.infer<typeof deleteSchema>;

interface DeleteDataPageProps {
    locale: string;
}

type DeleteState = 'idle' | 'loading' | 'success' | 'error';

export const DeleteDataPage = ({ locale }: DeleteDataPageProps) => {
    const t = useTranslations('newsletter.deleteData');
    const [state, setState] = useState<DeleteState>('idle');
    const [message, setMessage] = useState<string>('');

    const form = useForm<DeleteFormData>({
        resolver: zodResolver(deleteSchema),
        defaultValues: {
            email: '',
            confirmation: false,
            reason: '',
        },
    });

    const onSubmit = async (data: DeleteFormData) => {
        setState('loading');

        try {
            const response = await fetch('/api/newsletter/delete-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    language: locale,
                    confirmation: data.confirmation,
                    reason: data.reason,
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

    if (state === 'success') {
        return (
            <Section>
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="space-y-4">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                        <h1 className="text-3xl font-bold tracking-tight">
                            {t('success_title')}
                        </h1>
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {message}
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </Section>
        );
    }

    return (
        <Section>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <Trash2 className="h-16 w-16 mx-auto text-destructive" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t('description')}
                    </p>
                </div>

                <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        {t('warning_message')}
                    </AlertDescription>
                </Alert>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <h2 className="font-semibold">{t('what_deleted')}</h2>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• {t('deleted_subscription')}</li>
                        <li>• {t('deleted_consent')}</li>
                        <li>• {t('deleted_preferences')}</li>
                        <li>• {t('deleted_communications')}</li>
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

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('reason_label')}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('reason_placeholder')}
                                            className="min-h-[100px]"
                                            disabled={state === 'loading'}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={state === 'loading'}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                            {t('confirmation_text')}
                                        </FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

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
                            variant="destructive"
                            className="w-full"
                        >
                            {state === 'loading' && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('confirm_delete')}
                        </Button>
                    </form>
                </Form>

                <div className="text-sm text-muted-foreground">
                    <p>{t('gdpr_notice')}</p>
                </div>
            </div>
        </Section>
    );
};
