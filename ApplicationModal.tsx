import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    X, Sparkles, Loader2, Copy, Check, Trash2,
    ChevronDown, ChevronUp, ExternalLink, AlertCircle
} from 'lucide-react';
import { Application, ApplicationStatus, CreateApplicationPayload } from '@/types';
import { aiApi } from '@/api/ai';
import { getErrorMessage } from '@/utils/constants';

const STATUS_VALUES: [ApplicationStatus, ...ApplicationStatus[]] = [
    'Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected',
];

const schema = z.object({
    company: z.string().min(1, 'Company is required'),
    role: z.string().min(1, 'Role is required'),
    status: z.enum(STATUS_VALUES),
    jdLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    notes: z.string().optional(),
    dateApplied: z.string().optional(),
    salaryRange: z.string().optional(),
    location: z.string().optional(),
    seniority: z.string().optional(),
    followUpDate: z.string().optional(),
    followUpNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    application?: Application;
    onClose: () => void;
    onSave: (data: CreateApplicationPayload) => void;
    onDelete?: () => void;
    isSaving: boolean;
    isDeleting?: boolean;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-all"
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

export default function ApplicationModal({
    application,
    onClose,
    onSave,
    onDelete,
    isSaving,
    isDeleting,
}: Props) {
    const isEditing = !!application;

    const [jdText, setJdText] = useState(application?.jdText ?? '');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>(
        application?.resumeSuggestions ?? []
    );
    const [skills, setSkills] = useState<string[]>(application?.skills ?? []);
    const [niceToHave, setNiceToHave] = useState<string[]>(application?.niceToHave ?? []);
    const [showJD, setShowJD] = useState(!isEditing);
    const [showDelete, setShowDelete] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            company: application?.company ?? '',
            role: application?.role ?? '',
            status: application?.status ?? 'Applied',
            jdLink: application?.jdLink ?? '',
            notes: application?.notes ?? '',
            dateApplied: application?.dateApplied
                ? new Date(application.dateApplied).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            salaryRange: application?.salaryRange ?? '',
            location: application?.location ?? '',
            seniority: application?.seniority ?? '',
            followUpDate: application?.followUpDate
                ? new Date(application.followUpDate).toISOString().split('T')[0]
                : '',
            followUpNotes: application?.followUpNotes ?? '',
        },
    });

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleParse = useCallback(async () => {
        if (!jdText.trim() || jdText.length < 50) {
            setAiError('Please paste a job description (at least 50 characters).');
            return;
        }
        setAiError('');
        setAiLoading(true);
        try {
            setSuggestions([]); // Clear previous suggestions
            await aiApi.parsAndSuggestStream(jdText, (msg) => {
                if (msg.type === 'parsed') {
                    const parsed = msg.data;
                    if (parsed.company) setValue('company', parsed.company);
                    if (parsed.role) setValue('role', parsed.role);
                    if (parsed.location) setValue('location', parsed.location);
                    if (parsed.seniority) setValue('seniority', parsed.seniority);
                    setSkills(parsed.skills || []);
                    setNiceToHave(parsed.niceToHave || []);
                    setShowJD(false);
                } else if (msg.type === 'suggestion') {
                    setSuggestions((prev) => [...prev, msg.data]);
                }
            });
        } catch (err) {
            setAiError(getErrorMessage(err));
        } finally {
            setAiLoading(false);
        }
    }, [jdText, setValue]);

    const onSubmit = (data: FormData) => {
        onSave({
            ...data,
            jdText,
            skills,
            niceToHave,
            resumeSuggestions: suggestions,
            dateApplied: data.dateApplied ?? new Date().toISOString(),
            followUpDate: data.followUpDate || undefined,
        } as CreateApplicationPayload);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col glass-card animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-white">
                        {isEditing ? 'Edit Application' : 'Add Application'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* AI JD Parser */}
                    <div className="rounded-xl border border-brand-500/20 bg-brand-600/5 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowJD(!showJD)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand-600/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-brand-400" />
                                <span className="text-sm font-medium text-brand-300">
                                    AI Job Description Parser
                                </span>
                                {suggestions.length > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                        {suggestions.length} suggestions ready
                                    </span>
                                )}
                            </div>
                            {showJD ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>

                        {showJD && (
                            <div className="px-4 pb-4 space-y-3 border-t border-brand-500/20">
                                <p className="text-xs text-slate-500 pt-3">
                                    Paste a job description and click Parse — AI will auto-fill the fields and generate resume suggestions.
                                </p>
                                <textarea
                                    id="jd-text-area"
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                    placeholder="Paste the full job description here..."
                                    className="input-field h-40 resize-none font-mono text-xs"
                                />
                                {aiError && (
                                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-400">{aiError}</p>
                                    </div>
                                )}
                                <button
                                    id="parse-jd-btn"
                                    type="button"
                                    onClick={handleParse}
                                    disabled={aiLoading || jdText.length < 50}
                                    className="btn-primary w-full"
                                >
                                    {aiLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4" /> Parse & Generate Suggestions</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <form id="application-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="field-company" className="label">Company *</label>
                                <input id="field-company" {...register('company')} placeholder="Google" className="input-field" />
                                {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="field-role" className="label">Role *</label>
                                <input id="field-role" {...register('role')} placeholder="Senior Engineer" className="input-field" />
                                {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="field-status" className="label">Status</label>
                                <select id="field-status" {...register('status')} className="input-field">
                                    {STATUS_VALUES.map((s) => (
                                        <option key={s} value={s} className="bg-slate-900">{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="field-date" className="label">Date Applied</label>
                                <input id="field-date" type="date" {...register('dateApplied')} className="input-field" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="field-location" className="label">Location</label>
                                <input id="field-location" {...register('location')} placeholder="Remote / NYC" className="input-field" />
                            </div>
                            <div>
                                <label htmlFor="field-seniority" className="label">Seniority</label>
                                <input id="field-seniority" {...register('seniority')} placeholder="Senior" className="input-field" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="field-salary" className="label">Salary Range</label>
                                <input id="field-salary" {...register('salaryRange')} placeholder="$120k - $160k" className="input-field" />
                            </div>
                            <div>
                                <label htmlFor="field-jdlink" className="label">JD Link</label>
                                <div className="relative">
                                    <input id="field-jdlink" {...register('jdLink')} placeholder="https://..." className="input-field pr-8" />
                                    <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                                </div>
                                {errors.jdLink && <p className="text-red-400 text-xs mt-1">{errors.jdLink.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="field-notes" className="label">Notes</label>
                            <textarea id="field-notes" {...register('notes')} placeholder="Any additional notes..." rows={3} className="input-field resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="field-followup-date" className="label">Follow-up Date</label>
                                <input id="field-followup-date" type="date" {...register('followUpDate')} className="input-field" />
                            </div>
                            <div>
                                <label htmlFor="field-followup-notes" className="label">Follow-up Notes</label>
                                <textarea id="field-followup-notes" {...register('followUpNotes')} placeholder="Who to call?" rows={1} className="input-field resize-none" />
                            </div>
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div>
                                <label className="label">Required Skills (AI Extracted)</label>
                                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                                    {skills.map((s) => (
                                        <span key={s} className="px-2.5 py-1 rounded-lg bg-brand-600/15 text-brand-300 text-xs border border-brand-500/20">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {niceToHave.length > 0 && (
                            <div>
                                <label className="label">Nice-to-Have (AI Extracted)</label>
                                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                                    {niceToHave.map((s) => (
                                        <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-400 text-xs border border-slate-600/30">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Resume Suggestions */}
                    {suggestions.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-brand-400" />
                                <label className="label mb-0">AI Resume Suggestions</label>
                            </div>
                            <div className="space-y-2">
                                {suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 group"
                                    >
                                        <span className="text-brand-400 font-bold text-xs mt-0.5 flex-shrink-0">•</span>
                                        <p className="text-sm text-slate-300 flex-1 leading-relaxed">{s}</p>
                                        <CopyButton text={s} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div>
                        {isEditing && onDelete && (
                            <>
                                {showDelete ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">Confirm delete?</span>
                                        <button
                                            type="button"
                                            onClick={onDelete}
                                            disabled={isDeleting}
                                            className="btn-danger text-xs px-3 py-1.5"
                                        >
                                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDelete(false)}
                                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowDelete(true)}
                                        className="btn-danger"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="application-form"
                            disabled={isSaving}
                            className="btn-primary"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                isEditing ? 'Save Changes' : 'Add Application'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
