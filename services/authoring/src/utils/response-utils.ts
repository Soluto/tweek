import { Oid } from "nodegit/oid";
import { Response } from 'express';

export function addOid(response: Response, oid: Oid) {
  if (oid) {
    response.setHeader("x-oid", oid.tostrS());
  }
};