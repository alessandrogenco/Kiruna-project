import PropTypes from 'prop-types';
import { Col, ListGroupItem, Row, ListGroup } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/DocumentList.css';

function DocumentList(props){
    return(
        <>
            <h1 className='mx-4'>Documents</h1>
            <Row className='mx-4'>
                <Col className='text-start ms-1'>
                    <label>Title</label>
                </Col>
                {/*<Col className='text-center'>
                    Stakeholder
                </Col>
                <Col className='text-center'>
                    Date
                </Col>*/}
                <Col md="auto" className='me-4'>
                    Actions
                </Col>
            </Row>
            <ListGroup id="documents-list" variant="flush" className='documents-list mt-2'>
                {props.documents.map((doc) => <DocumentInList
                    key={doc.id}
                    documentData={doc}
                    updateDocument={props.updateDocument}
                    deleteDocument={props.deleteDocument}
                    />)}
            </ListGroup>
            <div style={{ height: '50px' }}></div>
        </>
    )
}

DocumentList.propTypes = {
    documents: PropTypes.array, 
    updateDocument: PropTypes.func,
    deleteDocument: PropTypes.func,
};

//custom-border mx-3 mb-2 p-2 border border-dark bg-light rounded

function DocumentInList(props){
    return(
        <ListGroupItem className="document-list-item rounded mx-4">
            <Row>
                <Col>
                    <label className='mt-2' onClick={() => handleLabelClick()}>{props.documentData.title}</label>
                </Col>
                <Col>
                    {console.log(props.documentData)}
                    <label>{props.documentData.date}</label>
                </Col>
                <Col className='text-end'>
                    <Link
                        className="btn btn-success bi bi-pencil me-2"
                        to={`/editDocument/${props.documentData.id}`}
                        state={{ document: props.documentData }}
                    />
                    <i className="btn btn-danger bi bi-trash" onClick={() => props.deleteDocument(props.documentData.id)}/> 
                </Col>
            </Row>
        </ListGroupItem>
    );

}

DocumentInList.propTypes = {
    documentData: PropTypes.object,
    updateDocument: PropTypes.func,
    deleteDocument: PropTypes.func,
};

export default DocumentList;
