import PropTypes from 'prop-types';
import { Col, ListGroupItem, Row, ListGroup } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

function DocumentList(props){
    return(
        <ListGroup id="documents-list" variant="flush">
            {props.documents.map((doc) => <DocumentInList
                key={doc.id}
                documentData={doc}
                updateDocument={props.updateDocument}
                deleteDocument={props.deleteDocument}
                />)}
        </ListGroup>
    )
}

DocumentList.propTypes = {
    documents: PropTypes.array, 
    updateDocument: PropTypes.func,
    deleteDocument: PropTypes.func,
};

function DocumentInList(props){
    return(
        <ListGroupItem className="custom-border">
            <Row>
                <Col>
                    <label className='mt-2' onClick={() => handleLabelClick()}>{props.documentData.title}</label>
                </Col>
                <Col>
                    {console.log(props.documentData)}
                    <label>{props.documentData.date}</label>
                </Col>
                <Col className='text-end'>
                    <Link className="btn btn-outline-primary bi bi-pencil me-3" to={'/'}/>
                    <i className="btn btn-outline-danger bi bi-trash" onClick={() => props.deleteDocument(props.documentData.id)}/> 
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