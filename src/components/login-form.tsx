'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { User } from '@/types';
import { createOrGetUser } from '@/lib/api';
import { APP_VERSION } from '@/lib/version';
import { useGlobalLoader } from '@/context/LoaderContext';

interface LoginFormProps extends React.ComponentProps<"div"> {
  onRegister: (user: User) => void;
}

export function LoginForm({
  className,
  onRegister,
  ...props
}: LoginFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showLoader, hideLoader } = useGlobalLoader();

  const validateForm = () => {
    const newErrors = { name: '', email: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      showLoader('Registering user...');
      try {
        const user = await createOrGetUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        });
        onRegister(user);
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ ...errors, email: 'Failed to register. Please try again.' });
        hideLoader();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex justify-center">
        <Image
          src="/lean_coffee_logo_small.svg"
          alt="Lean Coffee"
          width={96}
          height={96}
          priority
          className="w-48 h-48"
        />
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome to Lean Coffee</h1>
                  <p className="text-muted-foreground text-balance text-sm">
                    Enter your name and email to join the session
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </Field>
                <Field>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Joining...' : 'Get Started'}
                  </Button>
                </Field>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Lean Coffee v{APP_VERSION}
        </p>
        <p className="text-xs text-muted-foreground">
          by{' '}
          <a 
            href="https://github.com/cardiadev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-blue-600 transition-colors"
          >
            @cardiadev
          </a>
        </p>
      </div>
    </div>
  )
}
