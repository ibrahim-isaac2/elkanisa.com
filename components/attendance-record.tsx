"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Search,
  CalendarIcon,
  Download,
  Trash2,
  Edit,
  Save,
  Plus,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useTheme } from "@/app/ThemeContext";
import { cn } from "@/lib/utils";

interface Attendance {
  id: string;
  name: string;
  date: Date;
  formattedDate: string;
  notes: string;
  status: "حاضر" | "غائب" | "متأخر" | "معتذر";
}

interface AttendanceGroup {
  date: string;
  attendees: Attendance[];
}

export default function AttendanceRecord() {
  const { theme, toggleTheme } = useTheme();
  const [servantName, setServantName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [attendees, setAttendees] = useState<Attendance[]>([]);
  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState<"حاضر" | "غائب" | "متأخر" | "معتذر">("حاضر");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAttendee, setEditingAttendee] = useState<Attendance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("attendanceData");
    if (savedData) {
      try {
        const { servantName, serviceName, attendees } = JSON.parse(savedData);
        setServantName(servantName || "");
        setServiceName(serviceName || "");
        const parsedAttendees = attendees.map((attendee: any) => ({
          ...attendee,
          date: new Date(attendee.date),
        }));
        setAttendees(parsedAttendees || []);
      } catch (error) {
        console.error("خطأ في استرجاع البيانات:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (servantName || serviceName || attendees.length > 0) {
      localStorage.setItem("attendanceData", JSON.stringify({ servantName, serviceName, attendees }));
    }
  }, [servantName, serviceName, attendees]);

  const handleAddAttendee = () => {
    if (newName.trim()) {
      const dateFormatter = new Intl.DateTimeFormat("ar-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const newAttendee: Attendance = {
        id: Date.now().toString(),
        name: newName.trim(),
        date: selectedDate,
        formattedDate: dateFormatter.format(selectedDate),
        notes: newNote.trim(),
        status: newStatus,
      };
      setAttendees([...attendees, newAttendee]);
      setNewName("");
      setNewNote("");
      setNewStatus("حاضر");
    }
  };

  const handleUpdateAttendee = () => {
    if (editingAttendee && newName.trim()) {
      const dateFormatter = new Intl.DateTimeFormat("ar-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const updatedAttendees = attendees.map((attendee) =>
        attendee.id === editingAttendee.id
          ? {
              ...attendee,
              name: newName.trim(),
              date: selectedDate,
              formattedDate: dateFormatter.format(selectedDate),
              notes: newNote.trim(),
              status: newStatus,
            }
          : attendee,
      );
      setAttendees(updatedAttendees);
      setEditingAttendee(null);
      setNewName("");
      setNewNote("");
      setNewStatus("حاضر");
    }
  };

  const handleDeleteAttendee = (id: string) => {
    setAttendees(attendees.filter((attendee) => attendee.id !== id));
  };

  const handleEditAttendee = (attendee: Attendance) => {
    setEditingAttendee(attendee);
    setNewName(attendee.name);
    setNewNote(attendee.notes);
    setNewStatus(attendee.status);
    setSelectedDate(attendee.date);
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const printElement = document.createElement("div");
      printElement.style.position = "absolute";
      printElement.style.left = "-9999px";
      printElement.style.width = "210mm";
      printElement.style.height = "297mm";

      printElement.innerHTML = `
        <div id="print-content" style="direction: rtl; padding: 15mm; font-family: Arial; width: 180mm; height: 267mm; position: relative; color: #000000;">
          <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 5mm; color: #000000;">
            سجل الحضور والغياب
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 5mm;">
            <div style="text-align: right; font-size: 16px; color: #000000;">
              <p><strong>التاريخ:</strong> ${format(new Date(), "dd MMMM yyyy", { locale: ar })}</p>
            </div>
            <div style="text-align: right; font-size: 16px; color: #000000;">
              <p><strong>الخادم:</strong> ${servantName}</p>
              <p><strong>الخدمة:</strong> ${serviceName}</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                  م
                </th>
                <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                  اسم المخدوم
                </th>
                <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                  تاريخ الحضور
                </th>
                <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                  الحالة
                </th>
                <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                  ملاحظات
                </th>
              </tr>
            </thead>
            <tbody>
              ${filteredAttendees
                .slice(0, 20)
                .map((attendee, index) => {
                  let statusColor = "#ffffff";
                  if (attendee.status === "حاضر") statusColor = "#e6ffe6";
                  else if (attendee.status === "غائب") statusColor = "#ffe6e6";
                  else if (attendee.status === "متأخر") statusColor = "#fff9e6";
                  else if (attendee.status === "معتذر") statusColor = "#e6f2ff";

                  return `
                    <tr style="background-color: ${statusColor};">
                      <td style="border: 1px solid #000; padding: 2mm; text-align: center; font-size: 12px; color: #000000;">
                        ${index + 1}
                      </td>
                      <td style="border: 1px solid #000; padding: 2mm; text-align: right; font-size: 12px; color: #000000;">
                        ${attendee.name}
                      </td>
                      <td style="border: 1px solid #000; padding: 2mm; text-align: center; font-size: 12px; color: #000000;">
                        ${attendee.formattedDate}
                      </td>
                      <td style="border: 1px solid #000; padding: 2mm; text-align: center; font-size: 12px; color: #000000;">
                        ${attendee.status}
                      </td>
                      <td style="border: 1px solid #000; padding: 2mm; text-align: right; font-size: 12px; color: #000000;">
                        ${attendee.notes}
                      </td>
                    </tr>
                  `;
                })
                .join("")}
              ${Array(Math.max(0, 20 - filteredAttendees.length))
                .fill("")
                .map(
                  () => `
                    <tr>
                      <td style="border: 1px solid #000; padding: 2mm; height: 8mm;"></td>
                      <td style="border: 1px solid #000; padding: 2mm;"></td>
                      <td style="border: 1px solid #000; padding: 2mm;"></td>
                      <td style="border: 1px solid #000; padding: 2mm;"></td>
                      <td style="border: 1px solid #000; padding: 2mm;"></td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div style="margin-top: 10mm; display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 30%;">
              <p style="margin-bottom: 15mm; color: #000000;">توقيع المسؤول</p>
              <div style="border-top: 1px solid #000; width: 100%;"></div>
            </div>
            <div style="text-align: center; width: 30%;">
              <p style="margin-bottom: 15mm; color: #000000;">ختم الخدمة</p>
              <div style="border-top: 1px solid #000; width: 100%;"></div>
            </div>
          </div>
          
          <div style="position: absolute; bottom: 5mm; left: 0; right: 0; text-align: center; font-size: 10px; color: #000000;">
            تم إنشاء هذا التقرير بتاريخ ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ar })}
          </div>
        </div>
      `;

      document.body.appendChild(printElement);

      const element = document.getElementById("print-content");
      if (!element) {
        document.body.removeChild(printElement);
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(printElement);

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const imgWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

      if (filteredAttendees.length > 20) {
        const remainingAttendees = filteredAttendees.slice(20);
        const chunkedAttendees = [];
        for (let i = 0; i < remainingAttendees.length; i += 25) {
          chunkedAttendees.push(remainingAttendees.slice(i, i + 25));
        }

        chunkedAttendees.forEach((chunk, pageIndex) => {
          doc.addPage();

          const additionalPageElement = document.createElement("div");
          additionalPageElement.style.position = "absolute";
          additionalPageElement.style.left = "-9999px";
          additionalPageElement.style.width = "210mm";
          additionalPageElement.style.height = "297mm";

          additionalPageElement.innerHTML = `
            <div id="print-content-${pageIndex + 2}" style="direction: rtl; padding: 15mm; font-family: Arial; width: 180mm; height: 267mm; position: relative; color: #000000;">
              <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 5mm; color: #000000;">
                سجل الحضور والغياب - صفحة ${pageIndex + 2}
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 5mm;">
                <div style="text-align: right; font-size: 16px; color: #000000;">
                  <p><strong>التاريخ:</strong> ${format(new Date(), "dd MMMM yyyy", { locale: ar })}</p>
                </div>
                <div style="text-align: right; font-size: 16px; color: #000000;">
                  <p><strong>الخادم:</strong> ${servantName}</p>
                  <p><strong>الخدمة:</strong> ${serviceName}</p>
                </div>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                      م
                    </th>
                    <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                      اسم المخدوم
                    </th>
                    <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                      تاريخ الحضور
                    </th>
                    <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                      الحالة
                    </th>
                    <th style="border: 1px solid #000; padding: 3mm; text-align: center; font-size: 14px; font-weight: bold; color: #000000;">
                      ملاحظات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${chunk
                    .map((attendee, index) => {
                      let statusColor = "#ffffff";
                      if (attendee.status === "حاضر") statusColor = "#e6ffe6";
                      else if (attendee.status === "غائب") statusColor = "#ffe6e6";
                      else if (attendee.status === "متأخر") statusColor = "#fff9e6";
                      else if (attendee.status === "معتذر") statusColor = "#e6f2ff";

                      return `
                        <tr style="background-color: ${statusColor};">
                          <td style="border: 1px solid #000; padding: 2mm; text-align: center; font-size: 12px; color: #000000;">
                            ${20 + pageIndex * 25 + index + 1}
                          </td>
                          <td style="border: 1px solid #000; padding: 2mm; text-align: right; font-size: 12px; color: #000000;">
                            ${attendee.name}
                          </td>
                          <td style="border: 1px solid #000; padding: 2mm; text-align: center; font-size: 12px; color: #000000;">
                            ${attendee.formattedDate}
                          </td>
                          <td style="border: 1px solid #000; padding: 2mm; text-align: center; font-size: 12px; color: #000000;">
                            ${attendee.status}
                          </td>
                          <td style="border: 1px solid #000; padding: 2mm; text-align: right; font-size: 12px; color: #000000;">
                            ${attendee.notes}
                          </td>
                        </tr>
                      `;
                    })
                    .join("")}
                  ${Array(Math.max(0, 25 - chunk.length))
                    .fill("")
                    .map(
                      () => `
                        <tr>
                          <td style="border: 1px solid #000; padding: 2mm; height: 8mm;"></td>
                          <td style="border: 1px solid #000; padding: 2mm;"></td>
                          <td style="border: 1px solid #000; padding: 2mm;"></td>
                          <td style="border: 1px solid #000; padding: 2mm;"></td>
                          <td style="border: 1px solid #000; padding: 2mm;"></td>
                        </tr>
                      `,
                    )
                    .join("")}
                </tbody>
              </table>
              
              <div style="position: absolute; bottom: 5mm; left: 0; right: 0; text-align: center; font-size: 10px; color: #000000;">
                تم إنشاء هذا التقرير بتاريخ ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ar })}
              </div>
            </div>
          `;

          document.body.appendChild(additionalPageElement);

          const additionalElement = document.getElementById(`print-content-${pageIndex + 2}`);
          if (additionalElement) {
            html2canvas(additionalElement, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
            }).then((additionalCanvas) => {
              document.body.removeChild(additionalPageElement);
              const additionalImgData = additionalCanvas.toDataURL("image/jpeg", 0.95);
              doc.addImage(additionalImgData, "JPEG", 0, 0, imgWidth, imgHeight);

              if (pageIndex === chunkedAttendees.length - 1) {
                doc.save(`سجل_الحضور_${serviceName}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
              }
            });
          } else {
            document.body.removeChild(additionalPageElement);
          }
        });
      } else {
        doc.save(`سجل_الحضور_${serviceName}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      }
    } catch (error) {
      console.error("خطأ في إنشاء ملف PDF:", error);
      alert("حدث خطأ أثناء إنشاء الملف");
    }
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify({ servantName, serviceName, attendees }, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `سجل_الحضور_${serviceName}_${format(new Date(), "yyyy-MM-dd")}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const clearAllData = () => {
    setServantName("");
    setServiceName("");
    setAttendees([]);
    localStorage.removeItem("attendanceData");
  };

  const groupAttendeesByDate = (): AttendanceGroup[] => {
    const groups: { [key: string]: Attendance[] } = {};
    attendees.forEach((attendee) => {
      const dateKey = format(attendee.date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(attendee);
    });
    return Object.entries(groups)
      .map(([date, attendees]) => ({
        date,
        attendees,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredAttendees = attendees
    .filter((attendee) => {
      const matchesSearch =
        attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.notes.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "present") return matchesSearch && attendee.status === "حاضر";
      if (activeTab === "absent") return matchesSearch && attendee.status === "غائب";
      if (activeTab === "late") return matchesSearch && attendee.status === "متأخر";
      if (activeTab === "excused") return matchesSearch && attendee.status === "معتذر";
      return matchesSearch;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const attendanceStats = {
    total: attendees.length,
    present: attendees.filter((a) => a.status === "حاضر").length,
    absent: attendees.filter((a) => a.status === "غائب").length,
    late: attendees.filter((a) => a.status === "متأخر").length,
    excused: attendees.filter((a) => a.status === "معتذر").length,
  };

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const paginatedAttendees = filteredAttendees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "حاضر":
        return "bg-green-50 text-green-700";
      case "غائب":
        return "bg-red-50 text-red-700";
      case "متأخر":
        return "bg-yellow-50 text-yellow-700";
      case "معتذر":
        return "bg-blue-50 text-blue-700";
      default:
        return "";
    }
  };

  const renderTable = (statusFilter?: "حاضر" | "غائب" | "متأخر" | "معتذر") => {
    const filteredData = statusFilter
      ? paginatedAttendees.filter((attendee) => attendee.status === statusFilter)
      : paginatedAttendees;

    return (
      <>
        <div
          ref={tableRef}
          className={cn(
            "border rounded-lg overflow-hidden",
            theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white",
          )}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-transparent">
                <TableHead className="text-center font-bold text-sm sm:text-base">م</TableHead>
                <TableHead className="text-right font-bold text-sm sm:text-base">اسم المخدوم</TableHead>
                <TableHead className="text-center font-bold text-sm sm:text-base">تاريخ الحضور</TableHead>
                <TableHead className="text-center font-bold text-sm sm:text-base">الحالة</TableHead>
                <TableHead className="text-right font-bold text-sm sm:text-base">ملاحظات</TableHead>
                <TableHead className="text-center font-bold text-sm sm:text-base">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((attendee, index) => (
                  <TableRow
                    key={attendee.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors duration-300",
                      theme === "dark" && "hover:bg-gray-700",
                    )}
                  >
                    <TableCell className="text-center font-bold text-sm sm:text-base">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="text-right font-bold text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                      {attendee.name}
                    </TableCell>
                    <TableCell className="text-center text-sm sm:text-base">{attendee.formattedDate}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          `px-2 py-1 rounded-full text-xs sm:text-sm font-bold`,
                          getStatusColor(attendee.status),
                        )}
                      >
                        {attendee.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm sm:text-base max-w-[150px] sm:max-w-[200px] truncate">
                      {attendee.notes || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAttendee(attendee)}
                          className="h-8 w-8 p-0 sm:h-10 sm:w-10"
                        >
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 sm:h-10 sm:w-10 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            className={cn(
                              "bg-transparent",
                              theme === "dark" ? "border-gray-700" : "border-gray-300",
                            )}
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-bold text-sm sm:text-base">هل أنت متأكد؟</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm sm:text-base">
                                سيتم حذف بيانات المخدوم "{attendee.name}" بشكل نهائي.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className={cn(
                                  "font-bold text-sm sm:text-base",
                                  theme === "dark"
                                    ? "bg-gray-700 hover:bg-gray-600"
                                    : "bg-gray-200 hover:bg-gray-300",
                                )}
                              >
                                إلغاء
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAttendee(attendee.id)}
                                className={cn(
                                  "font-bold text-sm sm:text-base",
                                  theme === "dark"
                                    ? "bg-red-700 hover:bg-red-800"
                                    : "bg-red-500 hover:bg-red-600",
                                )}
                              >
                                نعم، احذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className={cn(
                      "text-center py-4 sm:py-8 font-bold text-sm sm:text-base",
                      theme === "dark" ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    {searchQuery
                      ? "لا توجد نتائج مطابقة للبحث"
                      : "لم يتم إضافة أي مخدومين بعد"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 sm:mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={cn(
                "font-bold text-sm sm:text-base",
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-200",
              )}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => changePage(pageNum)}
                  className={cn(
                    "w-8 h-8 text-sm sm:text-base font-bold",
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-200",
                    currentPage === pageNum &&
                      (theme === "dark" ? "bg-blue-700" : "bg-blue-500"),
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "font-bold text-sm sm:text-base",
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-200",
              )}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={cn(
        "max-w-6xl mx-auto p-2 sm:p-4 bg-transparent min-h-screen transition-colors duration-300",
        theme === "dark" ? "dark text-white" : "text-black",
      )}
    >
      <Card
        className={cn(
          "shadow-lg border overflow-hidden bg-transparent",
          theme === "dark" ? "border-gray-700" : "border-gray-300",
        )}
      >
        <CardHeader className="p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center bg-transparent">
          <CardTitle
            className={cn(
              "text-xl sm:text-2xl md:text-3xl font-bold text-center transition-colors duration-300",
              theme === "dark" ? "text-white" : "text-black",
            )}
          >
            سجل الحضور والغياب
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full transition-colors duration-300 mt-2 sm:mt-0"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-300" /> : <Moon className="h-5 w-5 text-gray-800" />}
          </Button>
        </CardHeader>

        <CardContent className="p-2 sm:p-4 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="servantName" className="text-sm sm:text-base font-bold">
                اسم الخادم
              </Label>
              <Input
                id="servantName"
                value={servantName}
                onChange={(e) => setServantName(e.target.value)}
                placeholder="أدخل اسم الخادم"
                className={cn(
                  "text-right text-sm sm:text-base h-10 sm:h-12 border-2 rounded-lg transition-colors duration-300 w-full",
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-black placeholder-gray-600",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-sm sm:text-base font-bold">
                اسم الخدمة
              </Label>
              <Input
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="أدخل اسم الخدمة"
                className={cn(
                  "text-right text-sm sm:text-base h-10 sm:h-12 border-2 rounded-lg transition-colors duration-300 w-full",
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-black placeholder-gray-600",
                )}
              />
            </div>
          </div>

          {servantName && serviceName ? (
            <>
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-4">
                  <TabsList
                    className={cn(
                      "grid grid-cols-5 w-full md:w-auto bg-transparent rounded-lg p-1",
                      theme === "dark" ? "border-gray-600" : "border-gray-300",
                    )}
                  >
                    <TabsTrigger
                      value="all"
                      className={cn(
                        "text-xs sm:text-sm md:text-base font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-md transition-colors duration-300",
                        theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200",
                        activeTab === "all" && (theme === "dark" ? "bg-gray-700" : "bg-gray-200"),
                      )}
                    >
                      الكل ({attendees.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="present"
                      className={cn(
                        "text-xs sm:text-sm md:text-base font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-md transition-colors duration-300",
                        theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200",
                        activeTab === "present" && (theme === "dark" ? "bg-gray-700" : "bg-gray-200"),
                      )}
                    >
                      حاضر ({attendanceStats.present})
                    </TabsTrigger>
                    <TabsTrigger
                      value="absent"
                      className={cn(
                        "text-xs sm:text-sm md:text-base font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-md transition-colors duration-300",
                        theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200",
                        activeTab === "absent" && (theme === "dark" ? "bg-gray-700" : "bg-gray-200"),
                      )}
                    >
                      غائب ({attendanceStats.absent})
                    </TabsTrigger>
                    <TabsTrigger
                      value="late"
                      className={cn(
                        "text-xs sm:text-sm md:text-base font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-md transition-colors duration-300",
                        theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200",
                        activeTab === "late" && (theme === "dark" ? "bg-gray-700" : "bg-gray-200"),
                      )}
                    >
                      متأخر ({attendanceStats.late})
                    </TabsTrigger>
                    <TabsTrigger
                      value="excused"
                      className={cn(
                        "text-xs sm:text-sm md:text-base font-bold py-1 sm:py-2 px-2 sm:px-4 rounded-md transition-colors duration-300",
                        theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200",
                        activeTab === "excused" && (theme === "dark" ? "bg-gray-700" : "bg-gray-200"),
                      )}
                    >
                      معتذر ({attendanceStats.excused})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="mt-0">
                  <Card
                    className={cn(
                      "mb-4 sm:mb-6 border rounded-lg overflow-hidden",
                      theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white",
                    )}
                  >
                    <CardHeader className="p-2 sm:p-4">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-bold">
                        {editingAttendee ? "تعديل بيانات المخدوم" : "إضافة مخدوم جديد"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newName" className="text-sm sm:text-base font-bold">
                            اسم المخدوم
                          </Label>
                          <Input
                            id="newName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="أدخل اسم المخدوم"
                            className={cn(
                              "text-right text-sm sm:text-base bg-transparent border-2 rounded-lg h-10 sm:h-12 w-full",
                              theme === "dark"
                                ? "border-gray-600 text-white placeholder-gray-400"
                                : "border-gray-300 text-black placeholder-gray-600",
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newStatus" className="text-sm sm:text-base font-bold">
                            الحالة
                          </Label>
                          <Select
                            value={newStatus}
                            onValueChange={(value) => setNewStatus(value as any)}
                          >
                            <SelectTrigger
                              id="newStatus"
                              className={cn(
                                "text-right text-sm sm:text-base bg-transparent border-2 rounded-lg h-10 sm:h-12 w-full",
                                theme === "dark"
                                  ? "border-gray-600 text-white"
                                  : "border-gray-300 text-black",
                              )}
                            >
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="حاضر" className="text-sm sm:text-base">حاضر</SelectItem>
                              <SelectItem value="غائب" className="text-sm sm:text-base">غائب</SelectItem>
                              <SelectItem value="متأخر" className="text-sm sm:text-base">متأخر</SelectItem>
                              <SelectItem value="معتذر" className="text-sm sm:text-base">معتذر</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base font-bold">التاريخ</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-between text-right text-sm sm:text-base bg-transparent border-2 rounded-lg h-10 sm:h-12",
                                theme === "dark"
                                  ? "border-gray-600 text-white hover:bg-gray-700"
                                  : "border-gray-300 text-black hover:bg-gray-200",
                              )}
                            >
                              {format(selectedDate, "dd MMMM yyyy", { locale: ar })}
                              <CalendarIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => date && setSelectedDate(date)}
                              initialFocus
                              className="text-sm sm:text-base"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newNote" className="text-sm sm:text-base font-bold">
                          ملاحظات
                        </Label>
                        <Textarea
                          id="newNote"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="أدخل ملاحظات إضافية..."
                          className={cn(
                            "text-right text-sm sm:text-base min-h-[80px] sm:min-h-[100px] bg-transparent border-2 rounded-lg w-full",
                            theme === "dark"
                              ? "border-gray-600 text-white placeholder-gray-400"
                              : "border-gray-300 text-black placeholder-gray-600",
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="p-2 sm:p-4 flex justify-end bg-transparent">
                      {editingAttendee ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpdateAttendee}
                            disabled={!newName.trim()}
                            className={cn(
                              "gap-2 text-sm sm:text-base font-bold",
                              theme === "dark" ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-500 hover:bg-blue-600",
                            )}
                          >
                            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                            حفظ التغييرات
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingAttendee(null);
                              setNewName("");
                              setNewNote("");
                              setNewStatus("حاضر");
                              setSelectedDate(new Date());
                            }}
                            className={cn(
                              "bg-transparent text-sm sm:text-base font-bold",
                              theme === "dark"
                                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-200",
                            )}
                          >
                            <X className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                            إلغاء
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleAddAttendee}
                          disabled={!newName.trim()}
                          className={cn(
                            "gap-2 text-sm sm:text-base font-bold",
                            theme === "dark" ? "bg-green-700 hover:bg-green-800" : "bg-green-500 hover:bg-green-600",
                          )}
                        >
                          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                          إضافة مخدوم
                        </Button>
                      )}
                    </CardFooter>
                  </Card>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative flex-1 w-full">
                      <Search
                        className={cn(
                          "absolute right-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5",
                          theme === "dark" ? "text-gray-400" : "text-gray-600",
                        )}
                      />
                      <Input
                        placeholder="بحث عن مخدوم..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "pl-10 pr-10 text-right text-sm sm:text-base bg-transparent border-2 rounded-lg h-10 sm:h-12 w-full",
                          theme === "dark"
                            ? "border-gray-600 text-white placeholder-gray-400"
                            : "border-gray-300 text-black placeholder-gray-600",
                        )}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "gap-2 text-sm sm:text-base bg-transparent border-2 rounded-lg font-bold w-full sm:w-auto",
                              theme === "dark"
                                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-200",
                            )}
                          >
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                            تصدير
                          </Button>
                        </DialogTrigger>
                        <DialogContent
                          className={cn(
                            "bg-transparent",
                            theme === "dark" ? "border-gray-700" : "border-gray-300",
                          )}
                        >
                          <DialogHeader>
                            <DialogTitle className="text-center text-sm sm:text-base font-bold">
                              تصدير البيانات
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label className="text-sm sm:text-base font-bold">تصدير إلى ملف JSON</Label>
                              <Button
                                onClick={exportJSON}
                                className={cn(
                                  "w-full gap-2 text-sm sm:text-base font-bold",
                                  theme === "dark"
                                    ? "bg-blue-700 hover:bg-blue-800 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white",
                                )}
                                disabled={attendees.length === 0}
                              >
                                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                تصدير البيانات
                              </Button>
                            </div>
                          </div>
                          <DialogFooter>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className={cn(
                                    "gap-2 text-sm sm:text-base font-bold w-full",
                                    theme === "dark"
                                      ? "bg-red-700 hover:bg-red-800"
                                      : "bg-red-500 hover:bg-red-600",
                                  )}
                                >
                                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                  مسح جميع البيانات
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                className={cn(
                                  "bg-transparent",
                                  theme === "dark" ? "border-gray-700" : "border-gray-300",
                                )}
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-sm sm:text-base font-bold">هل أنت متأكد؟</AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm sm:text-base">
                                    سيتم حذف جميع البيانات بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    className={cn(
                                      "text-sm sm:text-base font-bold",
                                      theme === "dark"
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-200 hover:bg-gray-300",
                                    )}
                                  >
                                    إلغاء
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={clearAllData}
                                    className={cn(
                                      "text-sm sm:text-base font-bold",
                                      theme === "dark"
                                        ? "bg-red-700 hover:bg-red-800"
                                        : "bg-red-500 hover:bg-red-600",
                                    )}
                                  >
                                    نعم، امسح البيانات
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        onClick={generatePDF}
                        className={cn(
                          "gap-2 text-sm sm:text-base font-bold w-full sm:w-auto",
                          theme === "dark"
                            ? "bg-blue-700 hover:bg-blue-800 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white",
                        )}
                        disabled={attendees.length === 0}
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        تصدير PDF
                      </Button>
                    </div>
                  </div>

                  {renderTable()}
                </TabsContent>

                <TabsContent value="present" className="mt-0">
                  {renderTable("حاضر")}
                </TabsContent>
                <TabsContent value="absent" className="mt-0">
                  {renderTable("غائب")}
                </TabsContent>
                <TabsContent value="late" className="mt-0">
                  {renderTable("متأخر")}
                </TabsContent>
                <TabsContent value="excused" className="mt-0">
                  {renderTable("معتذر")}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-6 sm:py-12 space-y-4">
              <div className="text-4xl sm:text-6xl">📋</div>
              <h3 className="text-xl sm:text-2xl font-bold">
                مرحبًا بك في سجل الحضور والغياب
              </h3>
              <p
                className={cn(
                  "text-gray-500 max-w-md mx-auto text-sm sm:text-base",
                  theme === "dark" && "text-gray-400",
                )}
              >
                يرجى إدخال اسم الخادم واسم الخدمة للبدء في تسجيل الحضور والغياب
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}