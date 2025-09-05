import React from "react";
import { PlanTableRow } from "./PlanTableRow";

export const PlanTable = ({ plans }: { plans: any[] }) => (
  <table className="w-full border border-[#e2cfc3] rounded-xl overflow-hidden text-sm">
    <thead className="bg-[#d5a16e] text-white">
      <tr>
        <th className="text-left p-3 sm:p-4">Plan Name</th>
        <th className="text-left p-3 sm:p-4">Starting Point</th>
        <th className="text-left p-3 sm:p-4">Destination</th>
        <th className="text-left p-3 sm:p-4"># of Restaurants</th>
        <th className="text-center p-3 sm:p-4"></th>
      </tr>
    </thead>
    <tbody className="bg-white">
      {plans.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center p-8 text-[#7a5c43] italic">
            No plans saved yet.
          </td>
        </tr>
      ) : (
        plans.map(plan => <PlanTableRow key={plan._id} plan={plan} />)
      )}
    </tbody>
  </table>
);