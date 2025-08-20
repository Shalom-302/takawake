"use client";

import React from "react";
import { ComponentLayout } from "../../../components/layout/component-layout";
import { ComponentSection } from "../../../components/layout/component-section";
import { ComponentExample } from "../../../components/layout/component-example";
import { SavingsGroupCard, MemberList } from "@/ds/components/composite/index";

export default function CompositePage() {
  return (
    <ComponentLayout
      title="Composite Components"
      description="Reusable composite components built for specific use cases in the application."
    >
      <ComponentSection
        id="introduction"
        title="Introduction"
        description="Composite components are higher-level UI elements that combine multiple base components to create more complex interfaces for specific use cases. These components help maintain consistency across the application and speed up development."
      />

      <ComponentSection
        id="savings-group-card"
        title="Savings Group Card"
        description="A card component designed to display information about savings groups (tontines) including status, members, payment dates, and actions."
      >
        <ComponentExample
          title="Default"
          description="The default savings group card displays all relevant information about a savings group."
          preview={
            <div className="w-full max-w-md">
              <SavingsGroupCard
                title="Family Savings"
                iconBgColor="#6E56CF"
                manager={{
                  name: "Emma Johnson",
                  initials: "EJ",
                }}
                members={[
                  { id: "1", name: "John Doe", initials: "JD" },
                  { id: "2", name: "Jane Smith", initials: "JS" },
                  { id: "3", name: "Mark Wilson", initials: "MW" },
                  { id: "4", name: "Sarah Brown", initials: "SB" },
                  { id: "5", name: "Alex Green", initials: "AG" },
                ]}
                status="not-started"
                startDate={new Date("2025-10-28")}
                onDetailsClick={() => {}}
                onContributeClick={() => {}}
              />
            </div>
          }
          code={`<SavingsGroupCard
  title="Family Savings"
  iconBgColor="#6E56CF"
  manager={{
    name: "Emma Johnson",
    initials: "EJ",
  }}
  members={[
    { id: "1", name: "John Doe", initials: "JD" },
    { id: "2", name: "Jane Smith", initials: "JS" },
    { id: "3", name: "Mark Wilson", initials: "MW" },
    { id: "4", name: "Sarah Brown", initials: "SB" },
    { id: "5", name: "Alex Green", initials: "AG" },
  ]}
  status="not-started"
  startDate={new Date("2025-10-28")}
  onDetailsClick={() => {}}
  onContributeClick={() => {}}
/>`}
        />

        <ComponentExample
          title="In Progress"
          description="A savings group card showing an active group with current round information."
          preview={
            <div className="w-full max-w-md">
              <SavingsGroupCard
                title="Travel Fund"
                iconBgColor="#2563EB"
                manager={{
                  name: "Jordan Alto",
                  initials: "JA",
                }}
                members={[
                  { id: "1", name: "John Doe", initials: "JD" },
                  { id: "2", name: "Jane Smith", initials: "JS" },
                  { id: "3", name: "Mark Wilson", initials: "MW" },
                  { id: "4", name: "Sarah Brown", initials: "SB" },
                ]}
                status="in-progress"
                nextPaymentDate={new Date("2025-11-15")}
                currentRound={3}
                totalRounds={10}
                onDetailsClick={() => {}}
                onContributeClick={() => {}}
              />
            </div>
          }
          code={`<SavingsGroupCard
  title="Travel Fund"
  iconBgColor="#2563EB"
  manager={{
    name: "Jordan Alto",
    initials: "JA",
  }}
  members={[
    { id: "1", name: "John Doe", initials: "JD" },
    { id: "2", name: "Jane Smith", initials: "JS" },
    { id: "3", name: "Mark Wilson", initials: "MW" },
    { id: "4", name: "Sarah Brown", initials: "SB" },
  ]}
  status="in-progress"
  nextPaymentDate={new Date("2025-11-15")}
  currentRound={3}
  totalRounds={10}
  onDetailsClick={() => {}}
  onContributeClick={() => {}}
/>`}
        />

        <ComponentExample
          title="Completed"
          description="A savings group card showing a completed group."
          preview={
            <div className="w-full max-w-md">
              <SavingsGroupCard
                title="Home Renovation"
                iconBgColor="#16A34A"
                manager={{
                  name: "Chris Taylor",
                  initials: "CT",
                }}
                members={[
                  { id: "1", name: "John Doe", initials: "JD" },
                  { id: "2", name: "Jane Smith", initials: "JS" },
                  { id: "3", name: "Mark Wilson", initials: "MW" },
                ]}
                status="completed"
                onDetailsClick={() => {}}
              />
            </div>
          }
          code={`<SavingsGroupCard
  title="Home Renovation"
  iconBgColor="#16A34A"
  manager={{
    name: "Chris Taylor",
    initials: "CT",
  }}
  members={[
    { id: "1", name: "John Doe", initials: "JD" },
    { id: "2", name: "Jane Smith", initials: "JS" },
    { id: "3", name: "Mark Wilson", initials: "MW" },
  ]}
  status="completed"
  onDetailsClick={() => {}}
/>`}
        />
      </ComponentSection>

      <ComponentSection
        id="member-list"
        title="Member List"
        description="A component for displaying a list of members with their information and actions."
      >
        <ComponentExample
          title="Default"
          description="The default member list displays members with their basic information."
          preview={
            <div className="w-full max-w-md">
              <MemberList
                title="Group Members"
                members={[
                  { 
                    id: "1", 
                    name: "John Doe", 
                    initials: "JD",
                    role: "Administrator",
                    status: "active"
                  },
                  { 
                    id: "2", 
                    name: "Jane Smith", 
                    initials: "JS",
                    role: "Member",
                    status: "active"
                  },
                  { 
                    id: "3", 
                    name: "Mark Wilson", 
                    initials: "MW",
                    role: "Member",
                    status: "pending"
                  },
                ]}
                showAddMember={true}
                onAddMember={() => {}}
              />
            </div>
          }
          code={`<MemberList
  title="Group Members"
  members={[
    { 
      id: "1", 
      name: "John Doe", 
      initials: "JD",
      role: "Administrator",
      status: "active"
    },
    { 
      id: "2", 
      name: "Jane Smith", 
      initials: "JS",
      role: "Member",
      status: "active"
    },
    { 
      id: "3", 
      name: "Mark Wilson", 
      initials: "MW",
      role: "Member",
      status: "pending"
    },
  ]}
  showAddMember={true}
  onAddMember={() => {}}
/>`}
        />

        <ComponentExample
          title="With Actions"
          description="A member list with action buttons for each member."
          preview={
            <div className="w-full max-w-md">
              <MemberList
                title="Team Members"
                variant="card"
                members={[
                  { 
                    id: "1", 
                    name: "John Doe", 
                    initials: "JD",
                    role: "Administrator",
                    status: "active",
                    actions: [
                      { label: "Edit", onClick: () => {}, variant: "ghost" },
                      { label: "Remove", onClick: () => {}, variant: "destructive" }
                    ]
                  },
                  { 
                    id: "2", 
                    name: "Jane Smith", 
                    initials: "JS",
                    role: "Member",
                    status: "active",
                    actions: [
                      { label: "Edit", onClick: () => {}, variant: "ghost" },
                      { label: "Remove", onClick: () => {}, variant: "destructive" }
                    ]
                  },
                ]}
              />
            </div>
          }
          code={`<MemberList
  title="Team Members"
  variant="card"
  members={[
    { 
      id: "1", 
      name: "John Doe", 
      initials: "JD",
      role: "Administrator",
      status: "active",
      actions: [
        { label: "Edit", onClick: () => {}, variant: "ghost" },
        { label: "Remove", onClick: () => {}, variant: "destructive" }
      ]
    },
    { 
      id: "2", 
      name: "Jane Smith", 
      initials: "JS",
      role: "Member",
      status: "active",
      actions: [
        { label: "Edit", onClick: () => {}, variant: "ghost" },
        { label: "Remove", onClick: () => {}, variant: "destructive" }
      ]
    },
  ]}
/>`}
        />

        <ComponentExample
          title="With Show More"
          description="A member list with a show more button for pagination."
          preview={
            <div className="w-full max-w-md">
              <MemberList
                title="Project Team"
                variant="outline"
                members={[
                  { id: "1", name: "John Doe", initials: "JD", role: "Designer" },
                  { id: "2", name: "Jane Smith", initials: "JS", role: "Developer" },
                  { id: "3", name: "Mark Wilson", initials: "MW", role: "Manager" },
                  { id: "4", name: "Sarah Brown", initials: "SB", role: "Designer" },
                  { id: "5", name: "Alex Green", initials: "AG", role: "Developer" },
                ]}
                maxVisible={3}
                showMoreText="View All Members"
                onShowMore={() => {}}
              />
            </div>
          }
          code={`<MemberList
  title="Project Team"
  variant="outline"
  members={[
    { id: "1", name: "John Doe", initials: "JD", role: "Designer" },
    { id: "2", name: "Jane Smith", initials: "JS", role: "Developer" },
    { id: "3", name: "Mark Wilson", initials: "MW", role: "Manager" },
    { id: "4", name: "Sarah Brown", initials: "SB", role: "Designer" },
    { id: "5", name: "Alex Green", initials: "AG", role: "Developer" },
  ]}
  maxVisible={3}
  showMoreText="View All Members"
  onShowMore={() => {}}
/>`}
        />
      </ComponentSection>

      <ComponentSection
        id="api-reference"
        title="API Reference"
        description="API reference for the composite components."
      >
        <h3 className="text-xl font-semibold mt-6 mb-4">Savings Group Card</h3>
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border px-4 py-2 text-left">Prop</th>
                <th className="border border-border px-4 py-2 text-left">Type</th>
                <th className="border border-border px-4 py-2 text-left">Default</th>
                <th className="border border-border px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">title</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">The title of the savings group</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">iconUrl</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">URL for the group icon</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">iconBgColor</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">#6E56CF</td>
                <td className="border border-border px-4 py-2 text-sm">Background color for the icon container</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">manager</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">object</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Information about the group manager</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">members</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">array</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Array of group members</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">status</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">not-started</td>
                <td className="border border-border px-4 py-2 text-sm">Status of the group: not-started, in-progress, or completed</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">startDate</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">Date</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">The date when the group will start</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">nextPaymentDate</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">Date</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">The date of the next payment</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">currentRound</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">number</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Current round number</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">totalRounds</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">number</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Total number of rounds</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">onDetailsClick</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">function</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Function called when the details button is clicked</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">onContributeClick</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">function</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Function called when the contribute/start button is clicked</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-xl font-semibold mt-10 mb-4">Member List</h3>
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border px-4 py-2 text-left">Prop</th>
                <th className="border border-border px-4 py-2 text-left">Type</th>
                <th className="border border-border px-4 py-2 text-left">Default</th>
                <th className="border border-border px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">title</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">The title of the member list</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">members</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">Member[]</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Array of members to display</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">variant</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">default</td>
                <td className="border border-border px-4 py-2 text-sm">Visual variant: default, card, or outline</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">size</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">default</td>
                <td className="border border-border px-4 py-2 text-sm">Size variant: default, sm, or lg</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">showAddMember</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">boolean</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">false</td>
                <td className="border border-border px-4 py-2 text-sm">Whether to show the add member button</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">onAddMember</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">function</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Function called when the add member button is clicked</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">emptyState</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">ReactNode</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Content to display when there are no members</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">maxVisible</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">number</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Maximum number of members to display before showing the show more button</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">showMoreText</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">string</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">Show More</td>
                <td className="border border-border px-4 py-2 text-sm">Text for the show more button</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 font-mono text-sm">onShowMore</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">function</td>
                <td className="border border-border px-4 py-2 font-mono text-sm">-</td>
                <td className="border border-border px-4 py-2 text-sm">Function called when the show more button is clicked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </ComponentLayout>
  );
}
