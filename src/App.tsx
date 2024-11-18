import BattleComponent from './Ranker.tsx'
import "./App.css";

function App() {
    let kendrick_test = ["Wesley's Theory", "For Free? (Interlude)", "King Kunta", "Institutionalized",
    "These Walls", "u", "Alright", "For Sale? (Interlude)", "Momma", "Hood Politics", "How Much A Dollar Cost", "Complexion (A Zulu Love)",
    "The Blacker The Berry", "You Ain't Gotta Lie (Momma Said)", "i", "Mortal Man"]
    return (
        <BattleComponent
            songDataToSort={kendrick_test}
        />
    );
}

export default App;
