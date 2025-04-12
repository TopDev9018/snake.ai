
interface ProgressbarProps {
    value?: number;
}

function Progressbar({ value = 0 }: ProgressbarProps) {
    return (
        <div className="w-100 d-flex justify-content-center">
            {(() => {
                let divs = [];
                for (let i = 0; i < 10; i++) {

                    // set rounded
                    let rounded = '';
                    if (i === 0) {
                        rounded = 'rounded-start-4';
                    } else if (i === 9) {
                        rounded = 'rounded-end-4'
                    }

                    // background-color
                    let bg_color = '';
                    bg_color = i < value ? 'bg-light-green-950' : 'bg-gray-400';

                    divs.push(<div key={i} className={`border border-2 border-black ${rounded} ${bg_color}`} style={{
                        width: '10%',
                        height: '48px'
                    }}></div>);
                }
                return divs;
            })()}
        </div>
    );
}

export default Progressbar;
