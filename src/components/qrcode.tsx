import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
    value: string;
    size?: number;
}

function QRCodeComponent({ value, size = 256 }: QRCodeProps) {
    return (
        <div className='mb-2'>
            <QRCodeSVG value={value} size={size} marginSize={1} />
        </div>
    );
};

export default QRCodeComponent;