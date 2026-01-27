'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <Card>
        <CardHeader className="text-center">
          <Image
            src="/lean_coffee_logo_small.svg"
            alt="AIR Lean Coffee"
            width={128}
            height={128}
            priority
            className="w-32 h-32 mx-auto mb-4"
          />
          <CardTitle>Welcome to AIR Lean Coffee</CardTitle>
          <CardDescription>
            Enter your name and email below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
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
                  placeholder="m@example.com"
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
                  {isSubmitting ? 'Registering...' : 'Get Started'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        AIR Lean Coffee v{APP_VERSION}
      </p>
    </div>
  )
}
