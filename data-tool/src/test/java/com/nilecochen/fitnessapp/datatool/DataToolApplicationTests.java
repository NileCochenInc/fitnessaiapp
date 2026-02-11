package com.nilecochen.fitnessapp.datatool;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import java.util.List;
import com.nilecochen.fitnessapp.datatool.entities.User;

@SpringBootTest
class DataToolApplicationTests {

	@Autowired
	private SessionFactory sessionFactory;


    @Test
    void contextLoads() {
    }

    @Test
    void testUserQuery() {
        Session session = sessionFactory.openSession();
        try {
            Query<User> query = session.createQuery("select u from User u", User.class);
            List<User> users = query.getResultList();

            users.forEach(System.out::println);
        } finally {
            session.close();
        }
    }

}
