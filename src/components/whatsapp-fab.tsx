
"use client"

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        fill="currentColor"
        {...props}
    >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 221.9-99.6 221.9-222 .1-59.3-23.1-115-64.8-156.8zM223.9 434.6c-33.8 0-66.3-9.3-94.3-26.7l-6.7-4-69.8 18.3L72 355.2l-4.5-7c-18.9-29.8-29.9-65.4-29.9-102.3 0-99.4 80.8-180.2 180.2-180.2 49 0 95.1 19.1 129.5 53.5 34.4 34.4 53.5 80.5 53.5 129.5 .1 99.4-80.7 180.2-180.1 180.2zM333.6 295.6c-15.1-7.5-89.4-44.1-103.3-49.1-13.9-5-24.1-7.5-34.3 7.5-10.2 15-39.1 49.1-47.9 59.3-8.8 10.2-17.7 11.5-32.8 3.8-15.1-7.7-63.5-23.5-120.9-74.7-44.8-39.8-75.2-89.1-82.9-104.2-7.7-15.1-.8-23.5 6.7-30.9 6.8-6.8 15.1-17.7 22.8-26.6 7.7-8.8 10.2-15.1 15.1-25.2 5-10.2 2.5-19.1-3.8-26.6-6.2-7.5-34.3-82.1-47-112.5-12.2-28.7-24.9-24.9-34.3-24.9-9.1 0-19.8 2.5-30 7.5-10.2 5-27.8 12.8-42.5 30.1-14.8 17.3-56.7 55.7-56.7 136.2 0 80.5 57.9 157.4 66.7 169.6 8.8 12.2 113.8 182.2 138.3 205.1 24.5 22.9 44 26.6 59.9 21.6 15.9-4.9 89.4-36.6 102.1-72.7 12.7-36.1 12.7-66.9 8.8-72.7s-15.1-8.8-30-16.3z" />
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
                <WhatsAppIcon className="h-7 w-7" />
            </Link>
        </motion.div>
    );
}
