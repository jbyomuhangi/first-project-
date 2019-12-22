import React from 'react';
import { Draggable } from 'react-beautiful-dnd'
import Modal from 'react-bootstrap/Modal'
import TaskDetails from './TaskDetails'

class Task extends React.Component {

  constructor(props) {
    super(props)
    this.state = {create: false}
  }

  componentDidMount() {
    
  }

  handleDel = () => {
    this.props.remove(this.props.task.id)
  }

  handleShow = () => {
    this.setState({ create: true });
  }

  handleClose = () => {
    this.setState({ create: false });
     
  }

  handleEdit = (editedTask) => {
    this.props.submit(editedTask)
    this.handleClose()
  }


  render() {
    return (
      <div>
        <Draggable draggableId={this.props.task.id} index={this.props.index} isDragDisabled={this.props.allowDrag}>
          {(provided) => (
            <div onDoubleClick={() => this.handleShow()} className='task'  {...provided.draggableProps} {...provided.dragHandleProps}
              ref={provided.innerRef}
            >
              <h4 style={{ "display": "flex", "justifyContent": "space-between" }}>
                {this.props.task.content.length > 11? this.props.task.content.slice(0,11)+ "...": this.props.task.content}
                {/* <Button style={{float:"right"}} variant="danger" onClick={this.handleDel}>
                        X
                      </Button> */}
                <span className="badge badge-dark">{this.props.task.points}</span>
              </h4>
            </div>

          )}
        </Draggable>

        <Modal size='sm' show={this.state.create} onHide={this.handleClose}>

          <Modal.Header closeButton>
            <Modal.Title>Story Details</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <TaskDetails columnId={this.props.columnId} 
              numberOfPhases={this.props.numberOfPhases}
              taskId={this.props.task.id}
              name={this.props.task.content}
              points={this.props.task.points}
              phase={this.props.task.phase}
              link={this.props.task.link}
              sprint={this.props.task.sprint}
              delete={() => this.handleDel()}
              edit={(editedTask) => this.handleEdit(editedTask)} />
          </Modal.Body>

        </Modal>
      </div>
    )
  }
}

export default Task;
