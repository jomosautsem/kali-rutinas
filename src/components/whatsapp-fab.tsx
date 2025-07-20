
"use client"

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M16.6 14c-.2-.1-1.5-.8-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6s0-.3.1-.4c.1-.1.2-.2.4-.4.1-.1.2-.2.3-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.5-.8-2.1-.2-.5-.4-.5-.5-.5h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.3c.1.1 1.5.8 3.6 2.6.5.4.9.7 1.2.9.5.2 1 .2 1.3.1.4-.1 1.5-.6 1.7-1.2.2-.5.2-1 .1-1.1l-.1-.1zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18.4a8.4 8.4 0 1 1 8.4-8.4 8.4 8.4 0 0 1-8.4 8.4z" />
    </svg>
);

type WhatsAppFABProps = {
    phoneNumber: string; // E.g., "+15551234567"
    className?: string;
};

export function WhatsAppFAB({ phoneNumber, className }: WhatsAppFABProps) {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

    return (
        <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.5,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <Link
                href={`https://wa.me/${cleanPhoneNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:bg-[#128C7E]',
                    className
                )}
                aria-label="Contactar por WhatsApp"
            >
                <WhatsAppIcon className="h-8 w-8" />
            </Link>
        </motion.div>
    );
}
