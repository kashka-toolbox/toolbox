'use client';
import React, { useState } from 'react';

import { CheckIcon, GlobeIcon } from '@radix-ui/react-icons';
import { useLocale } from 'next-intl';

import languages from '@/i18n/languages.json';
import { usePathname, useRouter } from '@/i18n/navigation';

import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './dropdown-menu';

const entries = languages.filter((l) => l.enabled);

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' aria-label='Language'>
                    <GlobeIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='max-h-[420px] overflow-y-auto'>
                {entries.map((l) => (
                    <DropdownMenuItem
                        key={l.code}
                        onSelect={() => {
                            setOpen(false);
                            if (l.code !== locale) {
                                router.replace(pathname, { locale: l.code });
                            }
                        }}
                    >
                        <span>{l.name}</span>
                        {l.code === locale ? <CheckIcon className='ml-auto' /> : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
