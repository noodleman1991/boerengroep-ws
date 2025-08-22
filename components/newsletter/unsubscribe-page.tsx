'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle, AlertCircle, Loader2, Brush, Heart } from 'lucide-react';

const unsubscribeSchema = z.object({
    reason: z.string().optional(),
    feedback: z.string().max(1000).optional(),
});

type UnsubscribeFormData = z.infer<typeof unsubscribeSchema>;

interface UnsubscribePageProps {
    locale: string;
    token?: string;
}

type UnsubscribeState = 'idle' | 'loading' | 'success' | 'error';

export const UnsubscribePage = ({ locale, token }: UnsubscribePageProps) => {
    const t = useTranslations('newsletter.unsubscribe');
    const router = useRouter();
    const [state, setState] = useState<UnsubscribeState>('idle');
    const [message, setMessage] = useState<string>('');

    const form = useForm<UnsubscribeFormData>({
        resolver: zodResolver(unsubscribeSchema),
        defaultValues: {
            reason: '',
            feedback: '',
        },
    });

    const onSubmit = async (data: UnsubscribeFormData) => {
        if (!token) return;

        setState('loading');

        try {
            const response = await fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    language: locale,
                    ...data,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setState('success');
                setMessage(result.message);
            } else {
                setState('error');
                setMessage(result.error);
            }
        } catch (error) {
            setState('error');
            setMessage(t('error_message'));
        }
    };

    if (!token) {
        return (
            <Section>
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t('no_token')}
                        </AlertDescription>
                    </Alert>
                </div>
            </Section>
        );
    }

    if (state === 'success') {
        return (
            <Section>
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="space-y-4">
                        <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
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

                    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                        <p className="text-muted-foreground">
                            {t('success_message')}
                        </p>
                        <Button
                            onClick={() => router.push(`/${locale}`)}
                            variant="outline"
                        >
                            {t('back_home')}
                        </Button>
                    </div>
                </div>
            </Section>
        );
    }

    return (
        <Section>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <Brush className="h-16 w-16 mx-auto text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t('description')}
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('reason_label')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('reason_placeholder')}
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
                            name="feedback"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('feedback_label')}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('feedback_placeholder')}
                                            className="min-h-[100px]"
                                            disabled={state === 'loading'}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
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

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={state === 'loading'}
                                variant="destructive"
                                className="flex-1"
                            >
                                {state === 'loading' && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t('confirm_unsubscribe')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/${locale}`)}
                                disabled={state === 'loading'}
                            >
                                {t('cancel')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </Section>
    );
};
