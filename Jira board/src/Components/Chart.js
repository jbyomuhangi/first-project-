import React from 'react'
import { Pie } from 'react-chartjs-2'


class Chart extends React.Component {
    state = {
        totals: [0, 0, 0, 0, 0]
    }

    componentWillMount() {
        this.getCounts()
    }

    componentWillReceiveProps() {
        this.getCounts()
    }

    getCounts = () => {
        const { totals } = this.state
        const columnIds = Object.keys(this.props.state.columns)

        columnIds.forEach((columnId, index) => {
            let totalPoints = 0
            //const taskIds = this.props.state.columns[columnId].taskIds

            const tasks = []
            const taskIds = Object.keys(this.props.state.tasks)
            taskIds.forEach(id => {
                if(this.props.state.tasks[id].stage === columnId){
                    tasks.push(id)
                }

            })
            


            tasks.forEach(taskId => {
                let points = this.props.state.tasks[taskId].points
                totalPoints = totalPoints + Number(points)
            })
            totals[index] = totalPoints
        })
        this.setState({ totals: totals })
    }

    render() {
        const columnIds = Object.keys(this.props.state.columns).map(id => this.props.state.columns[id].name)
        return (
            <div style={{ paddingBottom: "20px" }}>
                {this.state.totals.reduce((a, b) => { return a + b }, 0) === 0 ?
                        <h1>No data for Pie Chart</h1>
                    :
                    <Pie
                        data={{
                            labels: columnIds,
                            datasets: [{
                                data: this.state.totals,
                                backgroundColor: this.props.colors
                            }]
                        }}
                        height={80}
                    />
                }
            </div>
        )
    }
}

export default Chart