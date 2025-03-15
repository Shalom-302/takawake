Below are several example use cases you might include in your documentation to illustrate the benefits of the Advanced Audit plugin:

1. **User Activity Tracking:**

    * **Example:** Log when a user account is created, updated, or deleted.

    * **Use Case:** Helps administrators track and review changes to user records, which is useful for security audits and troubleshooting user-related issues.

2. **Content Management Auditing:**

    * **Example:** Record events such as when a blog post or article is published, updated, or removed.

    * **Use Case:** Provides a historical trail of content changes, allowing editors to revert undesirable changes and monitor editorial activity.

3. **Data Modification Monitoring:**

    * **Example:** Capture changes to sensitive data in an e-commerce platform (e.g., order status, pricing changes, inventory updates).

    * **Use Case:** Assists in identifying unauthorized modifications, ensuring data integrity, and complying with regulations such as PCI DSS.

4. **Administrative Actions:**

    * **Example:** Log actions performed by administrators such as role changes, configuration updates, or system settings adjustments.

    * **Use Case:** Enhances accountability by creating an audit trail of critical changes, which is essential for compliance and forensic investigations.

5. **Security and Compliance:**

    * **Example:** Track security-related events like password changes, multi-factor authentication (MFA) setup, or changes in permissions.

    * **Use Case:** Supports compliance with security standards by ensuring all critical security actions are recorded for review.

6. **Integration and Workflow Triggers:**

    * **Example:** When a specific event (like an order cancellation) is logged, trigger external notifications or workflows.

    * **Use Case:** Enables automated downstream processes such as alerting customer service, updating external inventory systems, or generating reports.

7. **Change Management:**

    * **Example:** Maintain logs for any changes made to configuration files, feature toggles, or application policies.

    * **Use Case:** Provides transparency and helps troubleshoot issues by understanding when and why a particular change was made.

These examples illustrate how the Advanced Audit plugin can serve various needs—from basic tracking of user and content changes to more advanced security and compliance functions. By integrating this plugin, administrators and auditors gain visibility into the application's operations and user activities, thereby enhancing accountability and facilitating troubleshooting and compliance efforts.

## Testing and Dashboard Visualization

To verify the functionality of the Advanced Audit plugin and populate its Grafana dashboard with representative data, you can use the included data generation script:

### Generate Audit Events

The `generate_audit_events.py` script creates various sample audit events to populate the advanced-audit dashboard in Grafana:

```bash
# Run from the project root
cd app/plugins/advanced_audit
python generate_audit_events.py --db-url "postgresql://postgres:postgres@localhost:5432/kaapi" --count 200
```

Options:
- `--db-url`: PostgreSQL database URL (default: "postgresql://postgres:postgres@localhost:5432/kaapi")
- `--table`: Name of the audit events table to use (default: "audit_events")
- `--count`: Number of audit events to generate (default: 100)
- `--delay`: Delay between generating events in seconds (default: 0.1)

### Verifying Dashboard Data

After running the script:

1. Open Grafana at http://localhost:3001
2. Navigate to the "Advanced Audit" dashboard
3. You should see various visualizations including:
   - Audit events by user
   - Actions frequency
   - Events by resource type
   - Status distribution (success/failure)
   - Timeline of events

If some panels display "No Data", ensure that:
- The database connection is properly configured
- The audit events table has been created and populated
- Prometheus is correctly scraping the metrics
