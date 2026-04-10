import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { getErrorMessage } from '@/utils/constants';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setServerError('');
        try {
            const res = await authApi.register(data.email, data.password);
            dispatch(setCredentials({ user: res.user, token: res.token }));
            navigate('/board');
        } catch (err) {
            setServerError(getErrorMessage(err));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
                        <Sparkles className="w-7 h-7 text-brand-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                    <p className="text-slate-400 text-sm mt-1">Start tracking your job applications with AI</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="reg-email" className="label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="reg-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                    className="input-field pl-10"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="reg-password" className="label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="reg-password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Min. 6 characters"
                                    {...register('password')}
                                    className="input-field pl-10"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="reg-confirm" className="label">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="reg-confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Repeat your password"
                                    {...register('confirmPassword')}
                                    className="input-field pl-10"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {serverError && (
                            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {serverError}
                            </div>
                        )}

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
