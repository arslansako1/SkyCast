import { useEffect, useRef } from "react"


export default function Popup({message, onClose, onConfirm, onCancel, type}){
    const dialogRef = useRef(null);

    useEffect(() => {
        dialogRef.current.showModal();


    }, [])

    if (type === "alert"){
    return(
        <dialog className="dialog" ref={dialogRef}>
           <div className="dialogDiv">
            <p className="dialogMessage">{message}</p>
        <button className="dialogBtnOne" onClick={onClose}>Close</button>
           </div>        
        </dialog>
   
    )
}

    if (type === "confirm"){
        return(
        <dialog className="dialog" ref={dialogRef}>
           <div className="dialogDiv">
            <p className="dialogMessage">{message}</p>
        <button className="dialogBtnOne" onClick={onConfirm}>Confirm</button>
        <button className="dialogBtnTwo" onClick={onCancel}>Cancel</button>
           </div>        
        </dialog>

        )
    }
}