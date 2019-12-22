import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'


class SubmissionForm extends React.Component{
    state={
        name: this.props.name ? this.props.name : '',
        points: this.props.points ? this.props.points : 0,
        phase: this.props.phase ? this.props.phase : '',
        link: this.props.link? this.props.link : '',
        sprint: this.props.sprint? this.props.sprint : 0,
        err:{
            name:'',
            points:''
        }
    }

    handleChange = (e) =>{
        e.preventDefault();
        const {id, value} = e.target
        this.setState({...this.state, [id]:value})

    }

    handleClose = (e) => {
        e.preventDefault()
        const editedTask = {
            id : this.props.taskId,
            name: this.state.name,
            points:this.state.points,
            columnId: this.props.columnId, 
            phase: Number(this.state.phase),
            sprint: Number(this.state.sprint),
            link: this.state.link
        }
        this.props.edit(editedTask)
    }

    handleDelete = (e) => {
        e.preventDefault()
        this.props.delete()
    }

    generateOptions = () => {
        const options = []
        let current = 1
        while(current <= this.props.numberOfPhases){
            
            options.push( <option value={current} selected={this.state.phase === current ? "selected" : ''}>{current}</option>)
            current +=1
        }
        
        return options
    }
  
  
  render(){
      console.log(this.props)
    return(
        <>
            <Form>
                <Form.Group controlId='name' onChange={this.handleChange}>
                    <Form.Label>Story Name</Form.Label>
                    <Form.Control type='text' rows='1' defaultValue={this.state.name}/>
                </Form.Group>

                <Form.Group controlId='points' onChange={this.handleChange}>
                    <Form.Label>Story Points</Form.Label>
                    <Form.Control type='number' rows='1' defaultValue={this.state.points}/>
                </Form.Group>

                <Form.Group controlId='sprint' onChange={this.handleChange}>
                    <Form.Label>Sprint Number</Form.Label>
                    <Form.Control type='number' rows='1' defaultValue={this.state.sprint}/>
                </Form.Group>

                <Form.Group controlId="phase" onChange={this.handleChange}>
                        <Form.Label>Phase</Form.Label>
                        <Form.Control as="select">
                            {this.generateOptions()}
                        </Form.Control>
                </Form.Group>

                <Form.Group controlId='link' onChange={this.handleChange}>
                        <Form.Label>Jira Link</Form.Label>
                        <Form.Control type='text' rows='1' defaultValue={this.state.link}/>
                </Form.Group>

                <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                    <Button variant="primary" type="submit" onClick={this.handleClose}>
                        Save 
                    </Button>

                    <Button variant="danger" onClick={this.handleDelete}>
                        Delete 
                    </Button>
                </div>

            </Form>
        </>
    )
  }
}

export default SubmissionForm;
