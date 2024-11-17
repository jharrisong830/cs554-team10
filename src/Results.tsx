import "./App.css";

const Results = ({ finalResults }: { finalResults: any[] }) => {
    const listItems = finalResults.map(result => <li>{result.rank}: {result.name}</li>);
    return (
        <div>
            <ol style={{ listStyle: 'none' }}>
                {listItems}
            </ol>
        </div>
    )
}

export default Results;