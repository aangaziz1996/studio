
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Not directly used
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Customer } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useEffect } from "react";

const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  plan: z.string().min(1, "Paket langganan wajib diisi"),
  installationDate: z.date({ required_error: "Tanggal instalasi wajib diisi" }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Customer, "id" | "status" | "nextPaymentDate" | "paymentHistory"> & { installationDate: string }) => void;
  defaultValues?: Partial<Customer>;
  onDelete?: (customerId: string) => void;
}

export function CustomerForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  onDelete,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    // Default values will be set by useEffect to correctly handle dynamic defaultValues
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: defaultValues?.name || "",
        address: defaultValues?.address || "",
        plan: defaultValues?.plan || "",
        installationDate: defaultValues?.installationDate ? parseISO(defaultValues.installationDate) : new Date(),
      });
    }
  }, [isOpen, defaultValues, form]);


  const handleSubmit = (data: CustomerFormValues) => {
    onSubmit({ ...data, installationDate: data.installationDate.toISOString() });
    // form.reset(); // Reset is handled by useEffect on open now
    // onClose(); // onClose should be called by the parent managing the dialog state
  };
  
  const isEditing = !!defaultValues?.id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        form.reset(); // Ensure form is reset when dialog is closed via overlay or X button
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
          {isEditing && defaultValues?.name && <DialogDescription>Mengedit detail untuk {defaultValues.name}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Pelanggan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat Pelanggan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paket Langganan</FormLabel>
                  <FormControl>
                    <Input placeholder="cth., 20 Mbps" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="installationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Instalasi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: require('date-fns/locale/id') })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={require('date-fns/locale/id')}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sm:justify-between">
              {isEditing && onDelete && defaultValues?.id && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => onDelete(defaultValues.id!)}
                  className="sm:mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              )}
              <div className="flex space-x-2 self-end mt-4 sm:mt-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button type="submit">{isEditing ? "Simpan Perubahan" : "Simpan Pelanggan"}</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
