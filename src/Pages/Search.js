import React from "react";
import { Form, FormControl, Button } from "react-bootstrap";

const Search = () => {
  return (
    <div className="">
      <Form className="d-flex">
        <FormControl type="search" placeholder="Search" aria-label="Search" />
        <Button variant="outline-success">
          <i className="bi bi-search"></i>
        </Button>
      </Form>
    </div>
  );
};

export default Search;
