
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Customer, CustomerStatus } from "@/lib/types";
import { Trash2, XIcon, Mail, User, Phone, MapPin, Tag, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { AppLogo } from "./AppLogo";
import { ScrollArea } from "./ui/scroll-area";

const customerStatusValues: [CustomerStatus, ...CustomerStatus[]] = ['Pending', 'Paid', 'Overdue'];

const customerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi").regex(/^\+?[0-9\s-]{7,}$/, "Format nomor telepon tidak valid"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().min(1, "Alamat wajib diisi"),
  plan: z.string().min(1, "Paket WiFi wajib diisi"),
  status: z.enum(customerStatusValues, { required_error: "Status wajib dipilih" }),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormValues) => void;
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
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      address: "",
      plan: "",
      status: "Pending",
    }
  });

  const isEditing = !!defaultValues?.id;

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: defaultValues?.name || "",
        phoneNumber: defaultValues?.phoneNumber || "",
        email: defaultValues?.email || "",
        address: defaultValues?.address || "",
        plan: defaultValues?.plan || "",
        status: defaultValues?.status || "Pending",
      });
    }
  }, [isOpen, defaultValues, form]);

  const handleSubmit = (data: CustomerFormValues) => {
    onSubmit(data);
  };

  const inputClassName = "text-base placeholder:text-slate-400"; // Standard input with border
  const formItemClassName = "space-y-1"; // Simpler FormItem without background

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-lg w-full h-full flex flex-col p-0 overflow-hidden bg-slate-50">
        <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
              <XIcon className="h-6 w-6" />
            </Button>
          </DialogClose>
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditing ? "Ubah Pelanggan" : "Tambah Pelanggan"}
          </h2>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <ScrollArea className="flex-grow">
          <div className="bg-emerald-700 text-white py-8 px-4 flex flex-col items-center justify-center">
            <AppLogo hideIcon subtitle="Natural" textClassName="text-4xl text-white" subtitleClassName="text-sm text-white opacity-90 tracking-wider" className="text-white"/>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 sm:p-6 space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="text-sm font-medium text-slate-700">Nama</FormLabel>
                    <FormControl>
                      <div className="flex items-center bg-white p-3 rounded-lg border border-input">
                        <User className="h-5 w-5 text-slate-400 mr-2" />
                        <Input placeholder="Nama Pelanggan" {...field} className={cn(inputClassName, "border-none focus-visible:ring-transparent py-0 h-auto bg-transparent w-full")} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs"/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="text-sm font-medium text-slate-700">Nomor Telepon</FormLabel>
                     <FormControl>
                      <div className="flex items-center bg-white p-3 rounded-lg border border-input">
                        <Phone className="h-5 w-5 text-slate-400 mr-2" />
                        <Input type="tel" placeholder="Nomor Telepon" {...field} className={cn(inputClassName, "border-none focus-visible:ring-transparent py-0 h-auto bg-transparent w-full")} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs"/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
                     <FormControl>
                       <div className="flex items-center bg-white p-3 rounded-lg border border-input">
                        <Mail className="h-5 w-5 text-slate-400 mr-2" />
                        <Input type="email" placeholder="Email (opsional)" {...field} className={cn(inputClassName, "border-none focus-visible:ring-transparent py-0 h-auto bg-transparent w-full")} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs"/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="text-sm font-medium text-slate-700">Alamat</FormLabel>
                     <FormControl>
                       <div className="flex items-center bg-white p-3 rounded-lg border border-input">
                        <MapPin className="h-5 w-5 text-slate-400 mr-2" />
                        <Input placeholder="Alamat" {...field} className={cn(inputClassName, "border-none focus-visible:ring-transparent py-0 h-auto bg-transparent w-full")} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs"/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="text-sm font-medium text-slate-700">Paket</FormLabel>
                     <FormControl>
                      <div className="flex items-center bg-white p-3 rounded-lg border border-input">
                        <Tag className="h-5 w-5 text-slate-400 mr-2" />
                        <Input placeholder="Paket WiFi" {...field} className={cn(inputClassName, "border-none focus-visible:ring-transparent py-0 h-auto bg-transparent w-full")} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs"/>
                  </FormItem>
                )}
              />
              {isEditing && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className={formItemClassName}>
                      <FormLabel className="text-sm font-medium text-slate-700">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="flex items-center bg-white rounded-lg border border-input">
                            <Activity className="h-5 w-5 text-slate-400 ml-3 mr-2" />
                            <SelectTrigger className={cn(inputClassName, "border-none focus:ring-transparent focus:ring-offset-0 py-3 h-auto bg-transparent w-full")}>
                              <SelectValue placeholder="Pilih status pelanggan" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Paid">Paid (Lunas)</SelectItem>
                          <SelectItem value="Overdue">Overdue (Jatuh Tempo)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs"/>
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </ScrollArea>

        <div className="p-4 sm:p-6 border-t bg-white">
          {isEditing && onDelete && defaultValues?.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(defaultValues.id!)}
              className="w-full mb-3"
              size="lg"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Pelanggan
            </Button>
          )}
          <Button type="button" onClick={form.handleSubmit(handleSubmit)} className="w-full bg-blue-500 hover:bg-blue-600 text-white" size="lg">
            {isEditing ? "Simpan Perubahan" : "Simpan Pelanggan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
