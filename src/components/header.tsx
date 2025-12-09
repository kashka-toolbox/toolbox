'use client';
import React, { useContext, useRef } from 'react';

import { ExitIcon, GearIcon, HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { AuthContext } from './auth-provider';
import { Button } from './ui/button';
import { CommandAndNavigationCommand } from './ui/CommandAndNavigationCommand';
import { FourDotsIcon } from './ui/Icons/FourDotsIcon';
import { Separator } from './ui/separator';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { DarkmodeToggle } from './ui/darkmode-toggle';


export default function Header() {
  const { isSignedIn, logout } = useContext(AuthContext) ?? {};

  return (
      <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container px-4 md:px-8 flex justify-around items-center gap-2 sm:gap-6 h-14 max-w-screen-2xl'>
          <span className='text-3xl font-groteskItalic font-black tracking-tight hidden sm:flex  gap-2 items-center min-w-fit flex-[1] basis-0'>
            <FourDotsIcon />
            <span>Kashka</span>
          </span>
          <div className='w-full flex justify-around'>
            <div className='relative h-[42px] overflow-visible w-full max-w-[600px]'>
              <CommandAndNavigationCommand className='absolute left-0 right-0 top-0 w-full h-max' />
            </div>
          </div>
          <div className='flex items-center space-x-2 md:justify-end flex-[1] basis-1 justify-end'>
            <Sheet>
              <SheetTrigger asChild>
                {
                  isSignedIn ?
                    <Button variant={'ghost'} size={'icon'}>
                      <PersonIcon />
                    </Button>
                    :
                    <Button variant={'ghost'} size={'icon'}>
                      <HamburgerMenuIcon />
                    </Button>
                }
              </SheetTrigger>
              <SheetContent>
                <span>
                  <SheetHeader>
                    <SheetTitle>USER NAME AND ICON HERE</SheetTitle>
                    <DarkmodeToggle />
                  </SheetHeader>
                  <Separator className='my-4' />
                  <SheetBody className='gap-1'>

                    <Button variant='sheet' size="sheet"><PersonIcon /> Your profile</Button>
                    <Button variant='sheet' size="sheet"><GearIcon /> Settings</Button>
                    <Separator className='my-2' />
                    <Button variant='sheet' size="sheet" onClick={() => logout!()}><ExitIcon /> Logout</Button>
                  </SheetBody>
                </span>

                <SheetFooter>
                  <span className='text-3xl font-groteskItalic font-black tracking-tight flex gap-2 items-center min-w-fit'>
                    <FourDotsIcon />
                    <span>Kashka</span>
                  </span>
                </SheetFooter>

              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  );
};
