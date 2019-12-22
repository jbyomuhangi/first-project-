import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'


class SubmissionForm extends React.Component {
    state = {
        name: '',
        points: 0,
        columnId: 'column1',
        phase: 1,
        link: '',
        sprint:0,
        err: {
            name: '',
            points: ''
        }
    }

    handleChange = (e) => {
        e.preventDefault();
        const { id, value } = e.target
        this.setState({ ...this.state, [id]: value })

    }

    handleSubmit = (e) => {
        e.preventDefault()
        const newItem = {
            id: this.state.name,
            name: this.state.name,
            points: this.state.points,
            columnId: this.state.columnId,
            phase: this.state.phase,
            link: this.state.link,
            sprint: this.state.sprint
        }

        this.props.submit(newItem)
        this.props.close()
    }

    generateOptions = () => {
        const options = []
        let current = 1 
        while(current <= this.props.numberOfPhases){
            options.push(<option value={current}> {current} </option>)
            current += 1 
        }
        return options
    }


    render() {
        return (
            <>
                <Form>
                    <Form.Group controlId='name' onChange={this.handleChange}>
                        <Form.Label>Story Name</Form.Label>
                        <Form.Control type='text' rows='1' />
                    </Form.Group>

                    <Form.Group controlId='points' onChange={this.handleChange}>
                        <Form.Label>Story Points</Form.Label>
                        <Form.Control type='number' rows='1' />
                    </Form.Group>

                    <Form.Group controlId='sprint' onChange={this.handleChange}>
                        <Form.Label>Sprint Number</Form.Label>
                        <Form.Control type='number' rows='1' />
                    </Form.Group>

                    <Form.Group controlId="phase" onChange={this.handleChange}>
                        <Form.Label>Phase</Form.Label>
                        <Form.Control as="select">
                           {this.generateOptions()}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="columnId" onChange={this.handleChange}>
                        <Form.Label>Status</Form.Label>
                        <Form.Control as="select">
                            {this.props.columnOrder.map(column => {
                                return <option key={column} value={column}>{this.props.columns[column].name}</option>
                            })}
                            
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId='link' onChange={this.handleChange}>
                        <Form.Label>Jira Link</Form.Label>
                        <Form.Control type='text' rows='1' />
                    </Form.Group>

                    <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                        Create
                </Button>

                </Form>
            </>
        )
    }
}

export default SubmissionForm;
