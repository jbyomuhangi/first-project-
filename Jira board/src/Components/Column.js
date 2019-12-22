import React from 'react';
import Task from './Task';
import {Droppable} from 'react-beautiful-dnd'
import Modal from 'react-bootstrap/Modal'
import SubmissionForm from './SubmissionForm'
import { SketchPicker } from 'react-color';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

class Column extends React.Component{
    state = {
        create: false,
        editColumn: false,
        colName: this.props.column.name,
        newName: '',
        showSelector: false
    }

    handleChangeComplete = (color) => {
        this.props.colorChange(this.props.id, color.hex)
      };
    
    handleDoubleClick = (e) => {
        if(this.props.columnIds.filter(elem => elem === e.target.id).length){
            this.setState({showSelector: true})
        }
    }

    handleShow= () => {
        this.setState({ create: true });
    }

    handleClose= () => {
        this.setState({ create: false });
    }

    handleChange = (e) => {
        e.preventDefault();
        const { id, value } = e.target
        this.setState({[id]: value })

    }

    handleUpdate = () => {

        const newCol = {
            id : this.props.id,
            name: this.state.newName
        }

        fetch('/api/columns', {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(newCol),
        })
        


        this.setState({colName: this.state.newName, editColumn: false})
    }


    handleDelete = () => {

        console.log("look here ###############")
        console.log(this.props.tasks)

        this.props.tasks.map(task => {
            this.props.remove(task.id)
        })

        fetch('/api/columns', {
            method: 'DELETE',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify({id: this.props.id}),
        })
        this.props.removeCol(this.props.id)

        this.setState({editColumn: false})
        
    }

    render(){
        return(
           <div className={ "column"} style={{background: this.props.color}} onDoubleClick={this.handleDoubleClick}>
               
               <div className='title' onDoubleClick={() => this.setState({editColumn: true})}> <h3>{this.state.colName}</h3></div>

                <Droppable droppableId={this.props.column.id}>
                    {(provided) => (
                        <div id={this.props.id} className='tasklist' ref={provided.innerRef} 
                        {...provided.droppableProps}
                        >
                        
                            {this.props.tasks.map((task, index) =>(
                                <Task key={task.id} task={task} index={index}
                                        submit={(res) => this.props.submit(res)}
                                        columnId={task.stage}
                                        numberOfPhases={this.props.numberOfPhases}
                                        allowDrag={this.props.allowDrag}
                                        remove ={(pos) => this.props.remove(pos)}/>
                            ) )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>



                <Modal size='sm' show={this.state.showSelector} onHide={() => this.setState({showSelector:false})}>
                
                <Modal.Header closeButton>
                    <Modal.Title>Select a colour</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <SketchPicker
                        color={ this.props.color }
                        onChangeComplete={ this.handleChangeComplete }
                    />
                </Modal.Body>

            </Modal>


            

                <Modal size='sm' show={this.state.create} onHide={this.handleClose}>
                
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new event</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <SubmissionForm columnId={this.props.column.id} 
                        submit={(res, id) => this.props.submit(res, id)}
                        close={() => this.handleClose()}/>
                    </Modal.Body>

                </Modal>



                <Modal show={this.state.editColumn} onHide={() => this.setState({editColumn: false})}>
                    
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Column</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form>
                            <Form.Group controlId='newName' onChange={this.handleChange}>
                                <Form.Label>Column Name</Form.Label>
                                <Form.Control type='text' rows='1' defaultValue={this.props.column.name}/>
                            </Form.Group>
                        </Form>

                        <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                            <Button variant="primary" type="submit" onClick={this.handleUpdate}>
                                Save 
                            </Button>

                            <Button variant="danger" onClick={this.handleDelete}>
                                Delete Column
                            </Button>
                        </div>
                        
                    </Modal.Body>
                    


                </Modal>


                
           </div>
                   
              
                
        )
    }
}

export default Column