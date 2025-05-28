"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Customer, CustomerStatus } from "@/lib/types";
import { MoreHorizontal, Edit, Trash2, FileSignature } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onRecordPayment: (customer: Customer) => void;
}

const getStatusBadgeVariant = (status: CustomerStatus) => {
  switch (status) {
    case "Paid":
      return "default"; // Greenish in some themes, or primary
    case "Pending":
      return "secondary"; // Yellowish/Orange
    case "Overdue":
      return "destructive"; // Reddish
    default:
      return "outline";
  }
};


export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onRecordPayment,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No customers found. Add a new customer to get started.</div>;
  }
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Install Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell>{customer.plan}</TableCell>
              <TableCell>{format(parseISO(customer.installationDate), "PP")}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(customer.status)} className={
                  customer.status === "Paid" ? "bg-green-500 hover:bg-green-600 text-white" :
                  customer.status === "Pending" ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                  customer.status === "Overdue" ? "bg-red-500 hover:bg-red-600 text-white" : ""
                }>
                  {customer.status}
                </Badge>
              </TableCell>
              <TableCell>{format(parseISO(customer.nextPaymentDate), "PP")}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRecordPayment(customer)}>
                      <FileSignature className="mr-2 h-4 w-4" /> Record Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(customer)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(customer.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
