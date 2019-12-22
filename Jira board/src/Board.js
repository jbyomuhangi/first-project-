import React from 'react';
import initialData from './Dummy'
import Column from './Components/Column'
import { DragDropContext } from 'react-beautiful-dnd'
import Chart from './Components/Chart'
import Modal from 'react-bootstrap/Modal'
import SubmissionForm from './Components/SubmissionForm'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import exportToExcel from './exportToExcel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExcel } from '@fortawesome/free-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import { DropDown } from '@sebgroup/react-components/dist/DropDown'
// import Dropdown from 'react-bootstrap/Dropdown'
import { Loader } from '@sebgroup/react-components/dist/Loader'
import Form from 'react-bootstrap/Form';

class Board extends React.Component {
    state = {
        initialData: initialData,
        showChart: true,
        showAdd: false,
        dataRetrieved: false,
        showFiltered: false,
        phases: 0,
        name:'',
        createCol: false, 
        selectedPhase: 0,
        colors: ['sandybrown', 'violet', 'khaki', 'deepskyblue', 'springgreen'],
        dropDownSelected: "All",
        dropDownList: []
        // dropDownList:[{label:"1", value: "Phase1"},{label:"2", value: "Phase2"},{label:"3", value: "Phase3"},{label:"All", value: "All"}],
    };

    componentWillUnmount() {
        this.save()
    }

    colorChange = (id, newColor) => {
        let a = this.state.colors.map(x => x)
        
        const index = this.state.initialData.columnOrder.findIndex(elem => elem === id)
        a[index] = newColor
        
        fetch('api/columns', {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify({id, name: this.state.initialData.columns[id].name , color: newColor})
        }).then(() => this.setState({ colors: a }))

    }

    componentDidMount() {
        //alerts the user whenever the try to close or reload the page if there are changes made
        // window.addEventListener("beforeunload", (e) => {
        //     e.preventDefault()
        //     const dialogText = 'Remember to save changes before closing!'   //message does not show :(
        //     e.returnValue = dialogText
        // })

        // this.setState({ totals: this.getCounts()})
        this.getAllData()
        // setTimeout(()=>{this.generateOptions()}, 500)

    }

    getAllData = () => {

        // fetch number of phases 
        fetch('/api/phases').then(response => response.json())
            .then(data => this.setState({ phases: Number(data.phases) }))

        // fetch column data 
        fetch('/api/columns').then(response => response.json())
            .then(data => {
                const newColumns = {}
                data.forEach(column => newColumns[column.id] = column)
                const columnOrder = Object.keys(newColumns)
                const colors = []
                columnOrder.forEach(col => colors.push(newColumns[col].color))


                const colData = {
                    ...this.state.initialData,
                    columns: newColumns,
                    columnOrder: columnOrder
                }

                this.setState({ initialData: colData, colors: colors })
            })

            // fetch tasks available 
            .then(
                fetch('/api/tasks').then(response => response.json())
                    .then(data => this.formatData(data))
            )
            .then(() => this.generateOptions())
    }


    formatData = (data) => {
        const tasks = {}
        data.forEach(task => {
            const item = task
            tasks[task.id] = item
        })

        const newData = {
            ...this.state.initialData,
            tasks: tasks
        }

        this.setState({ initialData: newData, dataRetrieved: true })
    }

    compareRelativePosition = (a, b) => {
        if (this.state.showFiltered) {
            return a.filteredRelativePosition - b.filteredRelativePosition
        }
        return a.relativePosition - b.relativePosition
    }

    dragEnd = result => {
        const { destination, source, draggableId } = result

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const start = this.state.initialData.columns[source.droppableId]
        const finish = this.state.initialData.columns[destination.droppableId]
        const tasks = this.state.initialData.tasks
        
        tasks[draggableId].stage = finish.id


        if (this.state.showFiltered) {
            tasks[draggableId] = { ...tasks[draggableId], filteredRelativePosition: destination.index }
        }
        else {
            tasks[draggableId] = { ...tasks[draggableId], relativePosition: destination.index }
        }



        let tasksArray = Object.keys(tasks).map(key => tasks[key])

        
        //MOVING BETWEEN DIFFERENT STAGES
        if (start.id !== finish.id) {
            //move evertyhing in new column down
            let newFilteredPos = 0
            tasksArray = tasksArray.map(task => {

                // IF IN FILTERED VIEW
                if (this.state.showFiltered) {

                    if (task.stage === finish.id && task.filteredRelativePosition >= destination.index && task.id !== draggableId && task.filteredRelativePosition !== tasksArray.filter(elem => elem.stage === finish.id).length - 1) {
                        return { ...task, filteredRelativePosition: task.filteredRelativePosition + 1 }

                    }

                    return { ...task }

                }
                // IF NOT IN FILTERED VIEW
                else {
                    if (task.stage === finish.id && task.relativePosition >= destination.index && task.id !== draggableId && task.relativePosition !== tasksArray.filter(elem => elem.stage === finish.id).length - 1) {
                        // IF PHASE IS THE SAME 
                        if (task.phase === tasks[draggableId].phase) {
                            return {
                                ...task, relativePosition: task.relativePosition + 1,
                                filteredRelativePosition: task.filteredRelativePosition + 1
                            }
                        }

                        return { ...task, relativePosition: task.relativePosition + 1 }


                    }
                    else {
                        if (task.phase === tasks[draggableId].phase && task.stage === finish.id && task.id !== draggableId) {
                            newFilteredPos += 1
                        }
                        return { ...task }
                    }

                }

            })

            if (!this.state.showFiltered) {
                tasksArray.forEach(task => {
                    if (task.id === draggableId) {
                        task.filteredRelativePosition = newFilteredPos
                    }
                })
            }


            //move everythin in old column up
            tasksArray = tasksArray.map(task => {

                // IF IN FILTERED VIEW
                if (this.state.showFiltered) {
                    if (task.stage === start.id && task.filteredRelativePosition > source.index && task.filteredRelativePosition !== 0) {
                        return { ...task, filteredRelativePosition: task.filteredRelativePosition - 1 }
                    }
                    else {
                        return { ...task }
                    }

                }
                // IF NOT IN FILTERED VIEW
                else {

                    if (task.stage === start.id && task.relativePosition > source.index && task.relativePosition !== 0) {
                        if (task.phase === tasks[draggableId].phase) {
                            return {
                                ...task, relativePosition: task.relativePosition - 1,
                                filteredRelativePosition: task.filteredRelativePosition - 1
                            }
                        }
                        return { ...task, relativePosition: task.relativePosition - 1 }
                    }

                    else {
                        return { ...task }
                    }
                }


            })
        }

        //MOVING WITHIN THE SAME STAGE
        else {
            let movedDown = source.index < destination.index
            const tasksInBetween = destination.index - source.index
            if (movedDown) {

                let newFilteredPos = tasks[draggableId].filteredRelativePosition
                tasksArray = tasksArray.map(task => {

                    // IF IN FILTERED VIEW  
                    if (this.state.showFiltered) {
                        if (task.stage === finish.id && task.filteredRelativePosition <= destination.index && task.id !== draggableId && task.filteredRelativePosition !== 0 && tasksInBetween >= destination.index - task.filteredRelativePosition) {
                            return { ...task, filteredRelativePosition: task.filteredRelativePosition - 1 }
                        }
                        else {
                            return { ...task }
                        }
                    }
                    // IF NOT IN FILTERED VIEW
                    else {

                        if (task.stage === finish.id && task.relativePosition <= destination.index && task.id !== draggableId && task.relativePosition !== 0 && tasksInBetween >= destination.index - task.relativePosition) {
        
                            // IF PHASE IS THE SAME 
                            if (task.phase === tasks[draggableId].phase) {
                                newFilteredPos += 1
                                return {
                                    ...task, relativePosition: task.relativePosition - 1,
                                    filteredRelativePosition: task.filteredRelativePosition - 1
                                }
                            }

                            return { ...task, relativePosition: task.relativePosition - 1 }
                        }
                        else {
                            return { ...task }
                        }
                    }


                })
                tasksArray.forEach(task => {
                    if (task.id === draggableId) {
                        task.filteredRelativePosition = newFilteredPos
                    }
                })

            }
            else {
                let newFilteredPos = tasks[draggableId].filteredRelativePosition
                tasksArray = tasksArray.map(task => {
                    // IF IN FILTERED VIEW
                    if (this.state.showFiltered) {
                        if (task.stage === finish.id && task.filteredRelativePosition >= destination.index && task.id !== draggableId && task.filteredRelativePosition !== tasksArray.filter(elem => elem.stage === finish.id).length - 1) {
                            return { ...task, filteredRelativePosition: task.filteredRelativePosition + 1 }
                        }
                        else {
                            return { ...task }
                        }


                    }

                    // IF NOT IN FILTERED VIEW 
                    else {
                        if (task.stage === finish.id && task.relativePosition >= destination.index && task.id !== draggableId && task.relativePosition !== tasksArray.filter(elem => elem.stage === finish.id).length - 1) {
        
                            // IF PHASE IS THE SAME 
                            if (task.phase === tasks[draggableId].phase) {
                                newFilteredPos -= 1
                                return {
                                    ...task, relativePosition: task.relativePosition + 1,
                                    filteredRelativePosition: task.filteredRelativePosition + 1
                                }
                            }

                            return { ...task, relativePosition: task.relativePosition + 1 }
                        }
                        else {
                            return { ...task }
                        }

                    }

                })

                tasksArray.forEach(task => {
                    if (task.id === draggableId) {
                        task.filteredRelativePosition = newFilteredPos
                    }
                })
            }
        }

        this.formatData(tasksArray)
        fetch('/api/save', {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(tasksArray),
        }).then(() => this.setState({ showChart: false }, () => { this.setState({ showChart: true }) }))

    }

    submitStory = (response) => {
        
        const newTasks = this.state.initialData.tasks;
        // const newFilteredIds = this.state.initialData.columns[`column${response.columnId}`].filtered
        newTasks[response.id] = {
            id: response.id,
            content: response.name,
            points: Number(response.points),
            stage: response.columnId,
            phase: Number(response.phase),
            sprint: Number(response.sprint),
            link: response.link,
            relativePosition: newTasks[response.id] && newTasks[response.id].relativePosition !== undefined ? newTasks[response.id].relativePosition : Object.keys(newTasks).filter(key => newTasks[key].stage === response.columnId).length,
            filteredRelativePosition: newTasks[response.id] && newTasks[response.id].filteredRelativePosition !== undefined ? newTasks[response.id].filteredRelativePosition : Object.keys(newTasks).filter(key => Number(newTasks[key].phase) === Number(response.phase) && newTasks[key].stage === response.columnId).length
        }


        const newState = {
            ...this.state.initialData,
            tasks: newTasks,
        }


        fetch('/api/tasks', {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(newTasks[response.id]),
        })


        this.setState({ initialData: newState }, () => { this.setState({ showChart: false }, () => { this.setState({ showChart: true }) }) })
    }

    removeTask = (pos) => {

        const newTasks = this.state.initialData.tasks
        const currentStage = newTasks[pos].stage
        const currentRelativePosition = newTasks[pos].relativePosition
        delete newTasks[pos]
        let tasksArray = Object.keys(newTasks).map(key => newTasks[key])
        
        //MOVING RELATIVE POSITION OF TASKS BELOW DELETED OBJECT UP
        tasksArray = tasksArray.map(task => {
            if (task.stage === currentStage && task.relativePosition > currentRelativePosition && task.relativePosition !== 0) {
                return { ...task, relativePosition: task.relativePosition - 1 }
            }
            else {
                return { ...task }
            }
        })

        this.formatData(tasksArray)

        
        const body = { id: pos }

        fetch('/api/tasks', {
            method: 'DELETE',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(body),
        })

        this.setState(this.setState({ showChart: false }, () => { this.setState({ showChart: true }) }))
        //this.setState({ initialData: newState, totals : this.getCounts()})

    }


    clearBoard = () => {
        const newState = {
            ...this.state.initialData,
            tasks: {},
        }

        this.setState({ initialData: newState }, () => this.setState({ initialData: newState }))
    }




    handleShow = () => {
        this.setState({ showAdd: true });
    }

    handleClose = () => {
        this.setState({ showAdd: false });
    }


    handleFilter = (e) => {
        const num = e
        if (num > 0) {
            fetch(`/api/tasks?phase=${num}`).then(res => res.json())
                .then(data => {
                    this.setState({ dataRetrieved: false, showFiltered: true, selectedPhase: num }, () => setTimeout(() => {
                        this.formatData(data);
                    }, 300))
                })
        }
        else {
            this.setState({ dataRetrieved: false, showFiltered: false, selectedPhase: 0 }, () => setTimeout(() => {
                this.getAllData();
            }, 300))
        }


    }

    // //Not needed
    // save() {
    //     //this state is. need to change back from column1.....column5 to 1...5
    //     console.log(JSON.stringify(Object.keys(this.state.initialData.tasks).map(elem => this.state.initialData.tasks[elem]).map(elem => elem['stage'] = Number(elem['stage'].slice(6)))))
    //     fetch('/api/save', {
    //         headers: new Headers({ 'content-type': 'application/json' }),
    //         method: 'POST',
    //         body: JSON.stringify(Object.keys(this.state.initialData.tasks).map(elem => this.state.initialData.tasks[elem]))

    //     })
    // }

    changeColumntoStatus = (column) => {
        return this.state.initialData.columns[column] ? this.state.initialData.columns[column].name : "";
    }

    generateOptions = () => {
        const options = []
        let current = 1
        while (current <= this.state.phases) {
            options.push({ label: `${current}`, value: `Phase${current}` })
            current += 1
        }
        options.push({ label: "All", value: "All" })
        this.setState({
            dropDownList: options
        })
        // const options = []
        // let current = 1
        // while (current <= this.state.phases){
        //     options.push(<Dropdown.Item as="button" name={current} onClick={this.handleFilter}> Phase {current}</Dropdown.Item>)
        //     current += 1
        // }
        // return options
    }

    addPhase = () => {
        fetch('/api/phases', {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify({ phases: this.state.phases + 1 }),
        })

        this.setState({ phases: this.state.phases + 1 }, () => this.generateOptions())
    }

    removePhase = () => {
        fetch('/api/phases', {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify({ phases: this.state.phases - 1 }),
        })

        this.setState({ phases: this.state.phases - 1 }, () => this.generateOptions())
    }

    createColumn = (e) => {
        e.preventDefault()

        const newColors = this.state.colors
        newColors.push('blue')

        let id = this.state.name
        const newCol = {
            id : id,
            name: id,
            color: 'blue'
        }

        const newColumnOrder = this.state.initialData.columnOrder
        newColumnOrder.push(id)


        const newData = {
            ...this.state.initialData,
            columns: {
                ...this.state.initialData.columns,
                [id]: newCol
            }

        }

    
        fetch('/api/columns', {
            method: 'POST',
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(newCol),
        })

        this.setState({ initialData: newData, colors: newColors })
    }

    removeColumn = (id) => {
        const data = this.state.initialData
        delete data.columns[id]
        let index = 0
        data.columnOrder.forEach((col, pos) => {
            if (col == id) {
                index = pos
                return
            }
        })

        data.columnOrder.splice(index, 1)
        this.setState({ initialData: data })
    }

    handleChange = (e) => {
        e.preventDefault();
        const { id, value } = e.target
        this.setState({[id]: value })

    }


    // capitalizeFirstLetter= (word)=>{
    //     return word.charAt(0).toUpperCase() + word.slice(1);
    // }
    render() {
        const x = Object.keys(this.state.initialData.tasks).map(elem => this.state.initialData.tasks[elem])
        let y = []
        let i = 1
        //arrange the tasks in order to be displayed on the Excel sheet
        while (i <= this.state.initialData.columnOrder.length) {
            //eslint-disable-next-line
            x.forEach((elem) => {
                if (elem.stage === `column${i}`)
                    y.push({ Task: elem.content, Points: elem.points, Status: this.changeColumntoStatus(elem.stage), Link: elem.link, Sprint: elem.sprint })
            })
            i = i + 1
        }

        const total = () => {
            let sum = 0
            y.forEach(elem => {
                sum += elem.Points
            })
            return sum
        }

        y.push({ Task: "Total Story Points", Points: total(), Status: "" })
        y.push({ Task: "", Points: "", Status: "" }) //add empty row in Excel sheet
        y.push({ Task: "", Points: "", Status: "" })
        y.push({ Task: "Status", Points: "Story Points", Status: "" })

        this.state.initialData.columnOrder.forEach(columnID => {
            let total = y.filter(elem => { 
                // console.log("elem", elem, "stage", this.changeColumntoStatus(columnID)); 
                return this.changeColumntoStatus(columnID) === elem.Status })
                .reduce((a, b) => b.Points + a, 0);
            y.push({ Task: this.state.initialData.columns[columnID].name, Points: total, Status: "" })

        })




        // const toDo = (y.filter(elem => elem.Status==="To do")).reduce((a, b) => b.Points + a, 0)
        // const inProgress = (y.filter(elem =>elem.Status==="In Progress")).reduce((a, b) => b.Points + a, 0)
        // const systest= (y.filter(elem =>elem.Status==="Ready for SYSTEST")).reduce((a, b) => b.Points + a, 0)
        // const prod= (y.filter(elem =>elem.Status==="Ready for Prod")).reduce((a, b) => b.Points + a, 0)
        // const done= (y.filter(elem =>elem.Status==="Done")).reduce((a, b) => b.Points + a, 0)
        // //y.push({content: "Total Task Points", points: {f:'SUM(B2:B18)'}, stage:""}) (if wanna use excel functions/equation)


        // y.push({Task: "To do", Points: toDo, Status:""})
        // y.push({Task: "In Progress", Points: inProgress, Status:""})
        // y.push({Task: "Ready for Systest", Points: systest, Status:""})
        // y.push({Task: "Ready for Prod", Points: prod, Status:""})
        // y.push({Task: "Done", Points: done, Status:""})


        return (
            <>
                <Navbar bg="dark" variant="dark">
                    <Nav className="mr-auto">
                        {/* <Button variant='danger' onClick={this.clearBoard}>Reset</Button> */}
                        <Button style={{ backgroundColor: "green", borderColor: "green" }} onClick={() => exportToExcel(y)}>
                            <FontAwesomeIcon icon={faFileExcel} /> Export to excel
                        </Button>
                        <Button style={{ marginLeft: "20px" }} variant="success" onClick={() => this.handleShow()}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Add Task
                        </Button>
                    </Nav>
                    
                    <div style={{ float: "right", display: "flex" }}>
                        <Button style={{ marginRight: "10px" }} variant="success" onClick={() => this.addPhase()}>
                            <FontAwesomeIcon icon={faPlusCircle} /></Button>
                        <DropDown
                            selectedValue={this.state.dropDownSelected}
                            list={this.state.dropDownList}
                            onChange={(selectedItem) => { this.setState({ dropDownSelected: selectedItem.label }, this.handleFilter(selectedItem.label)) }}
                            placeholder={`Phase: ${this.state.dropDownSelected}`} />
                        <Button style={{ marginLeft: "10px" }} variant="danger" onClick={() => this.removePhase()}>
                            <FontAwesomeIcon icon={faMinusCircle} /></Button>
                        {/* <Dropdown style={{background: 'white'}}>
                                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                                        Phase : {this.state.selectedPhase > 0 ? this.state.selectedPhase : 'All'}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {this.generateOptions(this.state.phases)}
                                        <Dropdown.Divider/>
                                        <Dropdown.Item as="button" name={0} onClick={this.handleFilter}> All </Dropdown.Item>

                                    </Dropdown.Menu>

                                </Dropdown> */}
                    </div>
                </Navbar>
                <Loader toggle={!this.state.dataRetrieved} fullscreen={true}/>
            <div className="container">
                {this.state.dataRetrieved ?
                    <>
                        <h1><strong>New Product Launch Status</strong></h1>
                        
               <DragDropContext onDragEnd={this.dragEnd}>
                   <div className='containerbox'>
                       {this.state.initialData.columnOrder.map(columnId => {
                           const column = this.state.initialData.columns[columnId]
    
                           const tasks = []
                           const taskIds = Object.keys(this.state.initialData.tasks)
                           taskIds.forEach(id => {
                               if(this.state.initialData.tasks[id].stage === columnId){
                                   tasks.push(this.state.initialData.tasks[id])
                               }

                           })
                           

                           //change happens to display filtered tasks in columns here 
                           //const tasks = column.taskIds.map(taskId => this.state.initialData.tasks[taskId])
                           
                           return <Column key={column.id} column={column}  submit={(res) => this.submitStory(res)}
                               id={columnId}
                               removeCol={(id) => this.removeColumn(id)}
                               numberOfPhases={this.state.phases}
                               tasks={tasks.sort(this.compareRelativePosition)}
                               columnIds = {this.state.initialData.columnOrder}
                               allowDrag={this.state.showFiltered}
                               remove ={this.removeTask} color={
                                this.state.colors[this.state.initialData.columnOrder.findIndex(elem => elem === columnId)]                         
                        
                               } colorChange={(id, colour) => this.colorChange(id, colour)}/>
                       }
                       )}
                   </div>
               </DragDropContext>

               <button onClick={() => this.setState({createCol: true})}> Add column</button>

               <button type="button" className="btn btn-primary btn-circle btn-xl bottom-right" onClick={() => this.handleShow()}><strong>+</strong></button>
               {/* <button onClick={this.addPhase}> Add phase</button>
               <button onClick={this.removePhase}> Remove phase</button> */}

                            {/* <button type="button" class="btn btn-primary btn-circle btn-xl bottom-right" onClick={() => this.handleShow()}><strong>+</strong></button> */}
                            <div className="square">
                                <h1>Current Status</h1>
                                {/* <Chart2 state={this.state.initialData} totals={this.state.totals}/> */}
                                {this.state.showChart ? <Chart state={this.state.initialData} colors={this.state.colors} /> : null}
                            </div>

                            <Modal size='sm' show={this.state.showAdd} onHide={this.handleClose}>

                                <Modal.Header closeButton>
                                    <Modal.Title>Add new Story</Modal.Title>
                                </Modal.Header>

                            <Modal.Body>
                                <SubmissionForm
                                    columns={this.state.initialData.columns}
                                    columnOrder={this.state.initialData.columnOrder}
                                    numberOfPhases={this.state.phases}
                                    submit={(res) => this.submitStory(res)}
                                    close={() => this.handleClose()} />
                            </Modal.Body>

                            </Modal>

                        <Modal show={this.state.createCol} onHide={() => this.setState({createCol: false})}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create New Column</Modal.Title>
                            </Modal.Header>


                            <Form>
                                <Form.Group controlId='name' onChange={this.handleChange}>
                                    <Form.Label>Column Name</Form.Label>
                                    <Form.Control type='text' rows='1'/>
                                </Form.Group>


                                <Button variant="primary" type="submit" onClick={this.createColumn}>
                                    Create 
                                </Button>

                            </Form>

                        </Modal>

                        


                        </>


                        :

                        null
                    }

                </div>
            </>
        )
    }
}

export default Board