package com.skillshare.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.lang.NonNull;


@Slf4j
@Configuration
@EnableMongoRepositories(basePackages = "com.skillshare.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String connectionString;

    @Value("${spring.data.mongodb.database}")
    private String databaseName;

    @Override
    @NonNull
    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    @Bean
    @NonNull
    public MongoClient mongoClient() {
        try {
            log.info("Initializing MongoDB connection...");
            ConnectionString connString = new ConnectionString(connectionString);
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(connString)
                    .build();
            MongoClient client = MongoClients.create(settings);
            log.info("MongoDB connection initialized successfully");
            return client;
        } catch (Exception e) {
            log.error("Failed to initialize MongoDB connection", e);
            throw new RuntimeException("Could not initialize MongoDB connection", e);
        }
    }

    @Bean
    public MongoTemplate mongoTemplate() throws Exception {
        try {
            MongoTemplate template = new MongoTemplate(mongoClient(), getDatabaseName());
            log.info("MongoDB template created successfully");
            return template;
        } catch (Exception e) {
            log.error("Failed to create MongoDB template", e);
            throw new RuntimeException("Could not create MongoDB template", e);
        }
    }

    @Bean
    public GridFsTemplate gridFsTemplate() throws Exception {
        try {
            return new GridFsTemplate(mongoTemplate().getMongoDatabaseFactory(), mongoTemplate().getConverter());
        } catch (Exception e) {
            log.error("Failed to create GridFS template", e);
            throw new RuntimeException("Could not create GridFS template", e);
        }
    }
}