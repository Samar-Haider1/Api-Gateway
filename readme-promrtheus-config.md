# Prometheus Installation and Configruation

[Prometheus download page]:https://prometheus.io/download/

## Step 1: Install Prometheus

1-Download and install Prometheus: Visit the [Prometheus download page] to download the appropriate version for your operating system.

2-Extract the downloaded archive and navigate to the Prometheus directory.

3-Create a configuration file named prometheus.yml. This file will define the targets (your Node.js application) to scrape metrics from.

## Step 2: Configure Prometheus

Open the prometheus.yml configuration file you created in the previous step and add a job to scrape metrics from your Node.js application. Here's an example configuration:

``` yaml
                                                                              Prometheus.yml
# my global config
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
            

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  - 'rules.yml'
  # - "second_rules.yml"


# Here it's Prometheus itself.
scrape_configs:
  - job_name: "my-app"

    static_configs:
 
      - targets: ["localhost:4001"] # Replace with your Node.js app's address
    metrics_path: /metrics  



```



## Step 3: Instrument Your Node.js Application

1-Install the prom-client package, which provides a Node.js client library for exporting metrics in a format that Prometheus can scrape:

``` node
# npm install prom-client
```

2-In your Node.js application, import and use the prom-client package to create and expose metrics. Here's a simple example:

```javascript
const express = require('express');
const prometheus = require('prom-client');

const app = express();
const port = 3000;

const register = new prometheus.Registry();

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['route'],
  registers: [register],
});

app.get('/', (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  // Your route logic here
  res.send('Hello World');
  end({ route: '/' });
});

// Expose metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
```

## Step 4: Start Prometheus and Verify Metrics

1-Start Prometheus assuming you are in the Prometheus directory

2-Access the Prometheus web UI by navigating to http://localhost:9090 in your browser. You can use the "Targets" page to verify that your Node.js application target is being scraped.

## Step 5: Visualize Metrics    

Prometheus provides a basic web UI for querying and visualizing metrics. You can use this UI to create graphs and visualize the metrics collected from your Node.js application.

Remember that this is a basic setup, please adjust the steps and code according to your specific needs and application structure.
</br></br>
</br></br>
</br></br>

# Alertmanager Installation and Configruation

[Alertmanager download page]:https://prometheus.io/download/#alertmanager

## Step 1: Install Alertmanager

Download and install Alertmanager: Visit the [Alertmanager download page] to download the appropriate version for your operating system.

Extract the downloaded archive and navigate to the Alertmanager directory.

Create a configuration file named alertmanager.yml. This file will define how Alertmanager should handle alerts and notifications.

## Step 2: Configure Alertmanager

Open the alertmanager.yml configuration file you created and define your notification configuration. Here's an example configuration that sends notifications via email using the built-in SMTP configuration:

``` yml
                                                                            alertmanager.yml
  route:
    group_by: ['job']
    group_wait: 30s
    group_interval: 5m
    repeat_interval: 1h
    receiver: 'tech-email'
    routes:
    - match:
        alertname: Watchdog
      receiver: 'null'
  receivers:
  - name: 'tech-email'
    email_configs:
    - to: 'example@jsbl.com'
      from: 'example@jsbl.com'
      auth_username: '**************'
      auth_identity: '**************'
      auth_password: '************'
      require_tls: no
      smarthost: '20.10.1.25:25' #replace this with you local smtp url
      send_resolved: true
  - name: 'null'
```

This configuration specifies that alerts should be grouped by their alert name and sent to the specified email address.

## Step 3: Integrate Alertmanager with Prometheus

1-Open your Prometheus configuration file (prometheus.yml), and add an alerting section to specify the Alertmanager instance:   

```yml
                                                                            prometheus.yml  
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```


## Step 4: Start Alertmanager and Verify Configuration

1- Start Alertmanager, assuming you are in the Alertmanager directory.

2- Access the Alertmanager web UI by navigating to http://localhost:9093 in your browser. This UI allows you to view and manage alerts, as well as test notifications.


## Step 5: Create Prometheus Alert Rules

To trigger alerts, you need to define alert rules in your Prometheus configuration. Alert rules specify conditions that, when met, generate alerts. Add an 'alerting section' to your 'prometheus.yml':

``` yml
                                                                            prometheus.yml
global:
  scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']  # Replace with your Alertmanager's address

rule_files:
  - 'alert.rules.yml'  # Create this file to define alerting rules
```


## Step 6: Define Alert Rules

1-Create a file named "alert-rules.yml" in the same directory as your Prometheus configuration. In this file, define your alerting rules. Here's an example rule that alerts when the HTTP request duration exceeds a certain threshold:

```yml
                                                                            alert-rules.yml
groups:
- name: example
  rules:
  - alert: HighRequestDuration
    expr: http_request_duration_seconds_bucket{le="0.1"} > 100
    for: 5m
    labels:
      severity: high
    annotations:
      summary: High request duration
      description: Request duration is high on {{ $labels.instance }}

```

## Step 7: Reload Prometheus Configuration

After defining alert rules, reload your Prometheus configuration or restart Prometheus to apply the new rules


## Step 8: Test Alerts

You can manually test alerts by triggering conditions that match your alert rules. Observe the Alertmanager UI to see the alerts being generated and notifications being sent.



