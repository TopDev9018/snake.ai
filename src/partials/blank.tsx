
interface BlankPageProps {
    component?: React.ReactNode
}

function BlankPage({ component = null }: BlankPageProps) {
    return (
        <div className="d-flex justify-content-center align-items-center border border-5 border-black w-100 p-2" style={{ height: "82vh" }}>
            {component}
        </div>
    );
}

export default BlankPage;
