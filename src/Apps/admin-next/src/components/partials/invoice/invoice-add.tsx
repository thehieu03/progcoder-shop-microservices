"use client";
"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Repeater from "./Repeater";
import Flatpickr from "react-flatpickr";

const InvoiceAddPage= () => {
  const [picker, setPicker] = useState(new Date());
  return (
    <div>
      <Card title="Create new invoice">
        <h4 className="text-slate-900 dark:text-white text-xl mb-4">
          #89572935Kh
        </h4>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div className="lg:col-span-2 col-span-1 text-slate-900 dark:text-slate-300 text-base font-medium">
              Recipient info-500
            </div>
            <div>
              <label htmlFor="default-picker" className=" form-label">
                Issued Date
              </label>

              <Flatpickr
                className="form-control py-2"
                value={picker}
                onChange={(date) => setPicker(date[0])}
                id="default-picker"
              />
            </div>

            <Textinput label="Name"  placeholder="Add your name" />
            <Textinput label="Phone"  placeholder="Add your phone" />
            <Textinput
              label="Email"
              
              placeholder="Add your email"
            />
            <div className="lg:col-span-2 col-span-1">
              <Textarea
                label="Address"
                placeholder="address"
                row={2}
              />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
            <div className="lg:col-span-2 col-span-1 text-slate-900 text-base dark:text-slate-300 font-medium">
              Owner info-500
            </div>

            <Textinput label="Name"  placeholder="Add your name" />
            <Textinput label="Phone"  placeholder="Add your phone" />
            <div className="lg:col-span-2 col-span-1">
              <Textinput
                label="Email"
                
                placeholder="Add your email"
              />
            </div>

            <div className="lg:col-span-2 col-span-1">
              <Textarea
                label="Address"
                placeholder="address"
                row={2}
              />
            </div>
          </div>
        </div>
        <div className="my-6">
          <Repeater />
        </div>
        <Textarea
          label="Additional note"
          
          row={2}
          placeholder="Note"
          className="lg:w-1/2"
        />
        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
          <Button text="Save" className="btn-dark" />
        </div>
      </Card>
    </div>
  );
};

export default InvoiceAddPage;
