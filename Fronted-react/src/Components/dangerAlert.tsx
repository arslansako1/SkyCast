import { useEffect, useRef } from "react"

interface DangerAlertProps {
    message: string;
    onClose: () => void;
};

export default function DangerAlert({message, onClose}: DangerAlertProps){
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        setTimeout(() => {
        dialogRef.current?.show();
            
        },  1000);
        
        setTimeout(() => {
            dialogRef.current?.close();
            onClose();
            
        },  5500);
        


    }, [onClose])

    
    return(
        <dialog className="dialog2" ref={dialogRef}>
           <div className="dialogDiv2">
            <p className="dialogMessage2">{message}</p>
           </div>        
        </dialog>
   
    )
}
