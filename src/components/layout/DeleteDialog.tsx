import { 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogFooter, 
    DialogTitle, 
    DialogClose 
} from "../ui/dialog";
import { Button } from "../ui/button";

interface ConfirmDeleteDialogProps {
    onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ onConfirm }: ConfirmDeleteDialogProps) {
    return (
        <DialogContent className="bg-white rounded-2xl w-full max-w-[min(90vw, 300px)]">
            <DialogHeader>
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogDescription>
                    Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                    <Button className="rounded-[5px]" variant="outline">Batal</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button className="bg-red-500 hover:bg-red-600 rounded-[5px]" variant="destructive" onClick={onConfirm}>Hapus</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}