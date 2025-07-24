
import Progressbar from "../components/progressbar";

interface TableMiningProgressProps {
    container_height: string,
    table?: React.ReactNode
}

function TableMiningProgress({ container_height = '70vh', table = null }: TableMiningProgressProps) {
    return (
        <div className="col-md-7 " style={{ minHeight: container_height }}>
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="fs-1" style={{ lineHeight: 'normal' }}>Mining Progress</div>
                    <div className="fs-1 fw-bolder text-light-green-950" style={{ lineHeight: 'normal' }}>502</div>
                </div>
                <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                {/* <hr className="border border-dashed border-black border-3 opacity-100"></hr>
                <div className="d-flex justify-content-center align-items-center gap-2 gap-lg-4">
                    <span className="fs-5 fs-xxl-9">Level3</span>
                    <Progressbar value={4} />
                    <span className="fs-5 fs-xxl-9">Level4</span>
                </div> */}
                {/* <hr className="border border-dashed border-black border-3 opacity-100"></hr> */}
            </div>
            {table === null ? <hr className="border border-dashed border-black border-3 opacity-100 my-0"></hr> : table}
        </div>
    )
}

export default TableMiningProgress;