
interface ModalProps {
    isOpen: boolean;
    isHeader: boolean;
    isFooter: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

function Modal({ isOpen, isHeader, isFooter, onClose, title = "", children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content bg-green-960">
                    <div className={`modal-header ${isHeader ? '' : 'd-none'}`}>
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="close" onClick={onClose}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                    <div className={`modal-footer ${isFooter ? '' : 'd-none'}`}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;
