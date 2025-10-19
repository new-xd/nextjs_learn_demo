'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });


import { z } from 'zod';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than 0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    console.log(validatedFields);
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    console.log(`Creating invoice for customer ${customerId} with amount ${amount} and status ${status}`);
    try {
        await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to create invoice.',
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });


export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }
    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;

    try {
        await sql`
    UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to update invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice');
    try {
        await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;
    }
    catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to delete invoice.',
        };
    }
    revalidatePath('/dashboard/invoices');
}


export type State = {
    message?: string | null;
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
};

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        console.error('Authentication Error:', error);
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            
            return; // This is actually a successful redirect
        }
        if(error instanceof AuthError) {
            switch(error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials';
                default:
                    return 'Authentication Error';
            }
        }
        return 'Authentication Error';
    }
}