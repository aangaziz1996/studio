
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
import type { Customer } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2, XIcon, Mail } from "lucide-react"; // Added Mail icon
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id as indonesiaLocale } from 'date-fns/locale';
import { useEffect } from "react";
import { AppLogo } from "./AppLogo";
import { ScrollArea } from "./ui/scroll-area";

const customerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi").regex(/^\+?[0-9\s-]{7,}$/, "Format nomor telepon tidak valid"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")), // Email is optional
  address: z.string().min(1, "Alamat wajib diisi"),
  plan: z.string().min(1, "Paket WiFi wajib diisi"),
  installationDate: z.date({ required_error: "Tanggal pemasangan wajib diisi" }),
  monthlyFee: z.preprocess(
    (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")),
    z.number({ invalid_type_error: "Biaya bulanan harus angka"}).min(0, "Biaya bulanan tidak boleh negatif")
  ),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Customer, "id" | "status" | "nextPaymentDate" | "paymentHistory"> & { installationDate: string }) => void;
  defaultValues?: Partial<Customer>; // Keep defaultValues for potential editing use later
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
      installationDate: new Date(),
      monthlyFee: 0,
      ...defaultValues, // Apply defaultValues if provided (for editing)
      installationDate: defaultValues?.installationDate ? parseISO(defaultValues.installationDate) : new Date(),
      monthlyFee: defaultValues?.monthlyFee ?? 0, // Ensure monthlyFee has a default
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
        installationDate: defaultValues?.installationDate ? parseISO(defaultValues.installationDate) : new Date(),
        monthlyFee: defaultValues?.monthlyFee ?? 0,
      });
    }
  }, [isOpen, defaultValues, form]);

  const handleSubmit = (data: CustomerFormValues) => {
    onSubmit({ 
      ...data, 
      installationDate: data.installationDate.toISOString(),
      monthlyFee: Number(data.monthlyFee) 
    });
  };

  const inputClassName = "border-none focus-visible:ring-transparent text-base w-full bg-transparent py-0 h-auto placeholder:text-slate-400";
  const formItemClassName = "bg-slate-100 p-1 rounded-xl shadow-sm";
  const formItemInnerPadding = "flex items-center p-3";
  const formMessageClassName = "px-3 pb-2 pt-0 text-xs";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        // form.reset(); // Reset is handled by useEffect based on defaultValues
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
            {isEditing ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </h2>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <ScrollArea className="flex-grow">
          <div className="bg-emerald-700 text-white py-8 px-4 flex flex-col items-center justify-center">
            <AppLogo className="text-white" iconClassName="h-12 w-12" textClassName="text-4xl"/>
            <p className="text-xs mt-2 opacity-80 tracking-wider">NISINAL NATURLD SAFE WORK</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 sm:p-6 space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="sr-only">Nama Pelanggan</FormLabel>
                    <div className={formItemInnerPadding}>
                      <FormControl>
                        <Input placeholder="Nama Pelanggan" {...field} className={inputClassName} />
                      </FormControl>
                    </div>
                    <FormMessage className={formMessageClassName}/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="sr-only">Nomor Telepon</FormLabel>
                     <div className={formItemInnerPadding}>
                      <FormControl>
                        <Input type="tel" placeholder="Nomor Telepon" {...field} className={inputClassName} />
                      </FormControl>
                    </div>
                    <FormMessage className={formMessageClassName}/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="sr-only">Email</FormLabel>
                     <div className={formItemInnerPadding}>
                      <Mail className="h-5 w-5 text-slate-400 mr-2" />
                      <FormControl>
                        <Input type="email" placeholder="Email (opsional)" {...field} className={inputClassName} />
                      </FormControl>
                    </div>
                    <FormMessage className={formMessageClassName}/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="sr-only">Alamat</FormLabel>
                     <div className={formItemInnerPadding}>
                      <FormControl>
                        <Input placeholder="Alamat" {...field} className={inputClassName} />
                      </FormControl>
                    </div>
                    <FormMessage className={formMessageClassName}/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="sr-only">Paket WiFi</FormLabel>
                     <div className={formItemInnerPadding}>
                      <FormControl>
                        <Input placeholder="Paket WiFi" {...field} className={inputClassName} />
                      </FormControl>
                    </div>
                    <FormMessage className={formMessageClassName}/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="installationDate"
                render={({ field }) => (
                  <FormItem className={cn(formItemClassName, "p-0")}>
                    <FormLabel className="sr-only">Tanggal Pemasangan</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"ghost"}
                            className={cn(
                              "w-full justify-between text-left font-normal h-auto text-base rounded-xl",
                              formItemInnerPadding,
                              !field.value && "text-slate-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: indonesiaLocale })
                            ) : (
                              <span>Tanggal Pemasangan</span>
                            )}
                            <CalendarIcon className="h-5 w-5 opacity-60" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={indonesiaLocale}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className={cn(formMessageClassName, "px-3")}/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyFee"
                render={({ field }) => (
                  <FormItem className={formItemClassName}>
                    <FormLabel className="sr-only">Biaya Bulanan</FormLabel>
                     <div className={formItemInnerPadding}>
                      <FormControl>
                        <Input type="number" placeholder="Biaya Bulanan (Rp)" {...field} 
                         onChange={e => field.onChange(parseFloat(e.target.value) || "")}
                         className={inputClassName} />
                      </FormControl>
                    </div>
                    <FormMessage className={formMessageClassName}/>
                  </FormItem>
                )}
              />
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
