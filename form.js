function toggleOptionalFields() {
    const optionalFields = document.getElementById('optional-fields');
    const button = event.target;

    if (optionalFields.style.display === 'none') {
        optionalFields.style.display = 'block';
        button.textContent = 'Hide Optional Fields';
    } else {
        optionalFields.style.display = 'none';
        button.textContent = 'Show Optional Fields';
    }
}

function generateJsonFromForm() {
    const appName = document.getElementById('app-name').value;
    const domain = document.getElementById('domain').value;
    const dnsRecord = document.getElementById('dns-record').value;
    const targetIds = document.getElementById('target-ids').value.split(',').map(id => id.trim());
    const targetPorts = document.getElementById('target-ports').value.split(',').map(port => parseInt(port.trim()));

    const protocol = document.getElementById('protocol').value || 'HTTPS';
    const listenPort = parseInt(document.getElementById('listen-port').value) || 443;
    const targetGroupName = document.getElementById('target-group-name').value || `tg-teich-xp-n-s12-w3-${appName}-${listenPort || "443"}`;
    const targetType = document.getElementById('target-type').value || 'instance';
    const deregistrationDelay = parseInt(document.getElementById('deregistration-delay').value) || 30;
    const stickinessType = document.getElementById('stickiness-type').value || 'lb_cookie';
    const stickinessEnabled = document.getElementById('stickiness-enabled').checked;
    const stickinessCookieName = document.getElementById('stickiness-cookie-name').value || null;
    const stickinessCookieDuration = parseInt(document.getElementById('stickiness-cookie-duration').value) || 86400;
    const healthPath = document.getElementById('health-path').value || '/isAlive.html';
    const healthPort = document.getElementById('health-port').value || 'traffic-port';
    const healthProtocol = document.getElementById('health-protocol').value || 'HTTPS';
    const unhealthyThreshold = parseInt(document.getElementById('unhealthy-threshold').value) || 3;
    const healthyThreshold = parseInt(document.getElementById('healthy-threshold').value) || 5;
    const healthInterval = parseInt(document.getElementById('health-interval').value) || 10;
    const healthTimeout = parseInt(document.getElementById('health-timeout').value) || 5;
    const certificateArn = document.getElementById('certificate-arn').value || null;
    const priority = document.getElementById('priority').value || null;
    const tags = JSON.parse(document.getElementById('tags').value || '{}');
    const tagsAll = JSON.parse(document.getElementById('tags-all').value || '{}');
    const stickinessDuration = parseInt(document.getElementById('stickiness-duration').value) || 3600;
    const stickinessEnabled2 = document.getElementById('stickiness-enabled2').checked;
    const dnsRecordType = document.getElementById('dns-record-type').value || 'A';
    const dnsRecordTtl = parseInt(document.getElementById('dns-record-ttl').value) || 300;

    const targets = targetIds.map((id, index) => ({
        id: id,
        port: targetPorts[index] || listenPort
    }));

    const json = {
        protocol: protocol.toUpperCase(),
        domain: domain,
        listen_port: listenPort,
        target_type: targetType,
        target_group_name: targetGroupName,
        deregistration_delay: deregistrationDelay,
        stickiness: {
            type: stickinessType.toLowerCase(),
            enabled: stickinessEnabled,
            cookie_name: stickinessCookieName,
            cookie_duration: stickinessCookieDuration
        },
        health_check: {
            path: healthPath,
            port: healthPort.replace(' ', '-').toLowerCase(),
            protocol: healthProtocol.toUpperCase(),
            unhealthy_threshold: unhealthyThreshold,
            healthy_threshold: healthyThreshold,
            interval: healthInterval,
            timeout: healthTimeout
        },
        dns_record: {
            name: dnsRecord,
            type: dnsRecordType,
            ttl: dnsRecordTtl
        },
        targets: targets,
        tags: {
            NAME: appName,
            ...tags
        },
        tags_all: tagsAll,
        stickiness_duration: stickinessDuration,
        stickiness_enabled: stickinessEnabled2,
        certificate_arn: certificateArn,
        priority: priority
    };

    document.getElementById('json-output').style.display = 'block';
    document.getElementById('json-pre').textContent = JSON.stringify(json, null, 2);
}

function saveGeneratedJson() {
    const json = document.getElementById('json-pre').textContent;
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const appName = document.getElementById('app-name').value.replace(/[^a-zA-Z0-9-_]/g, '_');
    link.href = URL.createObjectURL(blob);
    link.download = `${appName}.json`;
    link.click();
}
