"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, Loader2 } from "lucide-react";

type Props = {
    actionTaken: string | null | undefined;
    followUpdate: string | null | undefined;
    notes: string | null | undefined;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (b: boolean) => void;
    formData: { action: string; note: string; followUp: string };
    handleInputChange: (field: string, value: string) => void;
    handleActionSubmit: () => Promise<void>;
    saving?: boolean;
};

export default function TindakanDiambil(props: Props) {
    const { saving = false } = props; // Default to false if not provided

    return (
        <Card className="shadow-md rounded-[10px]">
            <CardHeader>
                <CardTitle className="text-lg text-blue-600">Tindakan yang Diambil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Info label="Sanksi/Tindakan" value={props.actionTaken} />
                <Info label="Tanggal Tindak Lanjut" value={props.followUpdate} />
                <Info label="Catatan" value={props.notes} />

                <div className="pt-4 border-t">
                    <Dialog open={props.isEditModalOpen} onOpenChange={props.setIsEditModalOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto rounded-[5px]"
                                disabled={saving}
                            >
                                <Edit className="w-4 h-4 mr-2" /> Update Tindakan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-[10px]">
                            <DialogHeader>
                                <DialogTitle>Update Tindakan</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="action">
                                        Tindakan Baru <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea 
                                        id="action" 
                                        value={props.formData.action} 
                                        onChange={(e) => props.handleInputChange("action", e.target.value)} 
                                        placeholder="Masukkan tindakan yang akan diambil" 
                                        className="min-h-[80px] rounded-[5px]"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="followUp">Tanggal Tindak Lanjut</Label>
                                    <Input 
                                        id="followUp" 
                                        type="date"
                                        value={props.formData.followUp} 
                                        onChange={(e) => props.handleInputChange("followUp", e.target.value)} 
                                        className="rounded-[5px]"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="note">Catatan Tambahan</Label>
                                    <Textarea 
                                        id="note" 
                                        value={props.formData.note} 
                                        onChange={(e) => props.handleInputChange("note", e.target.value)} 
                                        placeholder="Masukkan catatan tambahan (opsional)" 
                                        className="min-h-[80px] rounded-[5px]"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button 
                                        onClick={props.handleActionSubmit} 
                                        className="bg-blue-600 hover:bg-blue-700 text-white h-11 flex-1 rounded-[10px]"
                                        disabled={saving || !props.formData.action.trim()}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" /> Simpan
                                            </>
                                        )}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => props.setIsEditModalOpen(false)} 
                                        className="h-11 flex-1 rounded-[10px]"
                                        disabled={saving}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className="font-medium text-gray-800">{value || "-"}</p>
        </div>
    )
}