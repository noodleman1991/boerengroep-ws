'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';

interface VerifyEmailPageProps {
    locale: string;
    token?: string;
}

type VerificationState = 'idle' | 'loading' | 'success' | 'error';

export const VerifyEmailPage = ({ locale, token }: VerifyEmailPageProps) => {
    const t = useTranslations('newsletter.verify');
    const router = useRouter();
    const [state, setState] = useState<VerificationState>('idle');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token]);

    const verifyEmail = async (verificationToken: string) => {
        setState('loading');

        try {
            const response = await fetch('/api/newsletter/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: verificationToken,
                    language: locale,
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

    return (
        <Section>
            <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <Mail className="h-16 w-16 mx-auto text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t('description')}
                    </p>
                </div>

                {!token && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t('no_token')}
                        </AlertDescription>
                    </Alert>
                )}

                {state === 'loading' && (
                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{t('verifying')}</span>
                    </div>
                )}

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

                <div className="flex justify-center">
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
};
