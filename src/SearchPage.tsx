import { useEffect, useState } from "react";

export default function SearchPage(props: any) {

    const [results, setResults] = useState(null);
    const [searchValue, setSearchValue] = useState("album");
    const handleType = (e: any) => {
        setSearchValue(e.target.value);
    }

    useEffect(() => {
        console.log(`Search results: ${JSON.stringify(results)}`)
    }, [results]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
    
        let searchTerm: string = (document!.getElementById('searchTerm')! as HTMLInputElement).value!
    
        //validation..
    
        console.log(searchValue);
        const data = await props.handleSearch(searchTerm, searchValue);
        setResults(data);
    

        (document!.getElementById('searchTerm')! as HTMLInputElement).value = '';
      };

    return (
        <>
        <form id='simple-form' onSubmit={handleSubmit}>
        <label>
                Type of Search:
                <select value={searchValue} name="searchType" onChange={handleType}>
                    <option value="album">Album</option>
                    <option value="artist">Artist</option>
                    <option value="track">Track</option>
                </select>
            </label>
        <label>
          Search here:
          <input
            id='searchTerm'
            name='searchTerm'
            type='text'
            placeholder='Kanye West'
          />
        </label>

        <input type='submit' value='Submit' />
      </form>
      {results != null ? 
      <h1>Hi</h1>: <h2>bye</h2>}
    </>

    )
}