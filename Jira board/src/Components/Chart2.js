import React from 'react'
import { Pie } from 'react-chartjs-2'


// class Chart2 extends React.Component {

//     render() {
//         const columnIds = Object.keys(this.props.state.columns).map(id => this.props.state.columns[id].title)

//         return (
//             <div style={{ paddingBottom: "20px" }}>
//                 {this.props.totals.reduce((a, b) => { return a + b }, 0) === 0 ?
//                         <h1>No data for Pie Chart2
                        
//                         </h1>
//                     :
//                     <Pie
//                         data={{
//                             labels: columnIds,
//                             datasets: [{
//                                 data: this.props.totals,
//                                 backgroundColor: ['sandybrown', 'violet', 'khaki', 'deepskyblue', 'springgreen']
//                             }]
//                         }}
//                         height={80}
//                     />
//                 }
//             </div>
//         )
//     }
// }

 const Chart2 = (props) =>  {
    const columnIds = Object.keys(props.state.columns).map(id => props.state.columns[id].title)
    console.log('totals from chart2',props.totals)
        return (
            <div style={{ paddingBottom: "20px" }}>
                <Pie
                    data={{
                        labels: columnIds,
                        datasets: [{
                            data: [props.totals[0],props.totals[1],props.totals[2],props.totals[3],props.totals[4]],
                            backgroundColor: ['sandybrown', 'violet', 'khaki', 'deepskyblue', 'springgreen']
                        }]
                    }}
                    height={80}
                />
                
            </div>
        )

}

export default Chart2

 