export default function ChatWindow(props) { 

    return (
        <div id="chatWindow">
        {props.items.map((item, index) => (
          <BoxMessage name={props.items[index].name} text={props.items[index].text} />
        ))}
      </div>
    )
}

function BoxMessage(props) {
    return (
        <div>
            <p>{props.name} : {props.text}</p>
        </div>
    )
}