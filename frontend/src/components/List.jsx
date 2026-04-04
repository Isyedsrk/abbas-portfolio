const List = (props) =>{
    return(<>
        <p key={props.projectList.id} className="card-text" >{props.projectList.name}</p>
    </>
    )
}
export default List;